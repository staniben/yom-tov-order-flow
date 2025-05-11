import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AppState, Employee, Project, Allocation, WorkWeekSettings, StorageSettings } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseEmployee, DatabaseProject, DatabaseAllocation, DatabaseSettings } from "@/integrations/supabase/database.types";
import { toast } from "@/components/ui/use-toast";

// Initial state for loading state
const initialState: AppState = {
  employees: [],
  projects: [],
  allocations: [],
  companyLogo: null,
  companyName: "",
  workWeekSettings: {
    workDays: [true, true, true, true, true, false, false], // Sunday to Thursday by default
    hoursPerDay: 8.5,
  },
  storageSettings: {
    type: 'browser'
  }
};

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  addEmployee: (employee: Omit<Employee, "id">) => Promise<void>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addAllocation: (allocation: Omit<Allocation, "id">) => Promise<void>;
  updateAllocation: (employeeId: string, projectId: string, percentage: number) => Promise<void>;
  deleteAllocation: (employeeId: string, projectId: string) => Promise<void>;
  isAllocated: (employeeId: string, projectId: string) => boolean;
  updateCompanyLogo: (logoUrl: string) => Promise<void>;
  updateCompanyName: (name: string) => Promise<void>;
  updateWorkWeekSettings: (settings: Partial<WorkWeekSettings>) => Promise<void>;
  calculateProjectWorkHours: (projectId: string) => number;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Convert database types to app types
  const mapDatabaseEmployeeToEmployee = (dbEmployee: DatabaseEmployee): Employee => ({
    id: dbEmployee.id,
    name: dbEmployee.name,
    position: dbEmployee.position || undefined,
    department: dbEmployee.department || undefined,
  });

  const mapDatabaseProjectToProject = (dbProject: DatabaseProject): Project => ({
    id: dbProject.id,
    name: dbProject.name,
    startDate: new Date(dbProject.start_date),
    endDate: new Date(dbProject.end_date),
    workOrderPrimary: dbProject.work_order_primary,
    workOrderSecondary: dbProject.work_order_secondary,
    approvedHours: dbProject.approved_hours || undefined,
    budgetCode: dbProject.budget_code || undefined,
  });

  const mapDatabaseAllocationToAllocation = (dbAllocation: DatabaseAllocation): Allocation => ({
    employeeId: dbAllocation.employee_id,
    projectId: dbAllocation.project_id,
    percentage: dbAllocation.percentage,
  });

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*');
      
      if (employeesError) throw employeesError;
      
      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
      
      if (projectsError) throw projectsError;
      
      // Fetch allocations
      const { data: allocationsData, error: allocationsError } = await supabase
        .from('allocations')
        .select('*');
      
      if (allocationsError) throw allocationsError;
      
      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for initial setup
        throw settingsError;
      }

      // Map the data to our app types
      const employees = employeesData?.map(mapDatabaseEmployeeToEmployee) || [];
      const projects = projectsData?.map(mapDatabaseProjectToProject) || [];
      const allocations = allocationsData?.map(mapDatabaseAllocationToAllocation) || [];
      
      // Update state
      setState({
        employees,
        projects,
        allocations,
        companyLogo: settingsData?.company_logo || null,
        companyName: settingsData?.company_name || 'החברה שלי',
        workWeekSettings: {
          workDays: settingsData?.work_days || [true, true, true, true, true, false, false],
          hoursPerDay: settingsData?.hours_per_day || 8.5,
        },
        storageSettings: {
          type: settingsData?.storage_type as 'browser' | 'network' || 'browser',
          networkPath: settingsData?.network_path || undefined
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "שגיאה בטעינת נתונים",
        description: "אירעה שגיאה בטעינת הנתונים מהשרת",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  // CRUD operations for employees
  const addEmployee = async (employee: Omit<Employee, "id">) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert({
          name: employee.name,
          position: employee.position || null,
          department: employee.department || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        employees: [...prev.employees, mapDatabaseEmployeeToEmployee(data)],
      }));
      
      return;
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "שגיאה בהוספת עובד",
        description: "אירעה שגיאה בהוספת העובד",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: employee.name,
          position: employee.position,
          department: employee.department,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === id ? { ...e, ...employee } : e
        ),
      }));
      
      return;
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "שגיאה בעדכון עובד",
        description: "אירעה שגיאה בעדכון פרטי העובד",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        employees: prev.employees.filter((e) => e.id !== id),
        // Allocations will be automatically deleted by the CASCADE constraint
        allocations: prev.allocations.filter((a) => a.employeeId !== id),
      }));
      
      return;
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "שגיאה במחיקת עובד",
        description: "אירעה שגיאה במחיקת העובד",
        variant: "destructive",
      });
      throw error;
    }
  };

  // CRUD operations for projects
  const addProject = async (project: Omit<Project, "id">) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          start_date: project.startDate.toISOString().split('T')[0],
          end_date: project.endDate.toISOString().split('T')[0],
          work_order_primary: project.workOrderPrimary,
          work_order_secondary: project.workOrderSecondary,
          approved_hours: project.approvedHours || null,
          budget_code: project.budgetCode || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newProject = mapDatabaseProjectToProject(data);
      
      setState((prev) => ({
        ...prev,
        projects: [...prev.projects, newProject],
      }));
      
      return;
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "שגיאה בהוספת פרויקט",
        description: "אירעה שגיאה בהוספת הפרויקט",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      const updateData: any = {};
      
      if (project.name !== undefined) updateData.name = project.name;
      if (project.startDate !== undefined) updateData.start_date = project.startDate.toISOString().split('T')[0];
      if (project.endDate !== undefined) updateData.end_date = project.endDate.toISOString().split('T')[0];
      if (project.workOrderPrimary !== undefined) updateData.work_order_primary = project.workOrderPrimary;
      if (project.workOrderSecondary !== undefined) updateData.work_order_secondary = project.workOrderSecondary;
      if (project.approvedHours !== undefined) updateData.approved_hours = project.approvedHours;
      if (project.budgetCode !== undefined) updateData.budget_code = project.budgetCode;
      
      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === id ? { ...p, ...project } : p
        ),
      }));
      
      return;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "שגיאה בעדכון פרויקט",
        description: "אירעה שגיאה בעדכון פרטי הפרויקט",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
        // Allocations will be automatically deleted by the CASCADE constraint
        allocations: prev.allocations.filter((a) => a.projectId !== id),
      }));
      
      return;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "שגיאה במחיקת פרויקט",
        description: "אירעה שגיאה במחיקת הפרויקט",
        variant: "destructive",
      });
      throw error;
    }
  };

  // CRUD operations for allocations
  const addAllocation = async (allocation: Omit<Allocation, "id">) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .insert({
          employee_id: allocation.employeeId,
          project_id: allocation.projectId,
          percentage: allocation.percentage,
        });
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        allocations: [...prev.allocations, allocation],
      }));
      
      return;
    } catch (error) {
      console.error('Error adding allocation:', error);
      toast({
        title: "שגיאה בהוספת שיבוץ",
        description: "אירעה שגיאה בהוספת שיבוץ לפרויקט",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAllocation = async (employeeId: string, projectId: string, percentage: number) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .update({ percentage })
        .eq('employee_id', employeeId)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        allocations: prev.allocations.map((a) =>
          a.employeeId === employeeId && a.projectId === projectId
            ? { ...a, percentage }
            : a
        ),
      }));
      
      return;
    } catch (error) {
      console.error('Error updating allocation:', error);
      toast({
        title: "שגיאה בעדכון שיבוץ",
        description: "אירעה שגיאה בעדכון אחוז השיבוץ",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteAllocation = async (employeeId: string, projectId: string) => {
    try {
      const { error } = await supabase
        .from('allocations')
        .delete()
        .eq('employee_id', employeeId)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      setState((prev) => ({
        ...prev,
        allocations: prev.allocations.filter(
          (a) => !(a.employeeId === employeeId && a.projectId === projectId)
        ),
      }));
      
      return;
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast({
        title: "שגיאה במחיקת שיבוץ",
        description: "אירעה שגיאה במחיקת השיבוץ מהפרויקט",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Settings operations
  const updateSettings = async (settings: Partial<DatabaseSettings>) => {
    try {
      // First check if we have any settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from('settings')
        .select('id')
        .limit(1);
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (existingSettings && existingSettings.length > 0) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from('settings')
          .update(settings)
          .eq('id', existingSettings[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Create new settings
        const { error: insertError } = await supabase
          .from('settings')
          .insert({
            ...settings,
            company_name: settings.company_name || 'החברה שלי',
            storage_type: settings.storage_type || 'browser',
            network_path: settings.network_path || null,
            work_days: settings.work_days || [true, true, true, true, true, false, false],
            hours_per_day: settings.hours_per_day || 8.5
          });
          
        if (insertError) throw insertError;
      }
      
      return;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "שגיאה בעדכון הגדרות",
        description: "אירעה שגיאה בעדכון הגדרות המערכת",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCompanyLogo = async (logoUrl: string) => {
    try {
      await updateSettings({ company_logo: logoUrl });
      
      setState((prev) => ({
        ...prev,
        companyLogo: logoUrl,
      }));
      
      return;
    } catch (error) {
      throw error;
    }
  };

  const updateCompanyName = async (name: string) => {
    try {
      await updateSettings({ company_name: name });
      
      setState((prev) => ({
        ...prev,
        companyName: name,
      }));
      
      return;
    } catch (error) {
      throw error;
    }
  };

  const updateWorkWeekSettings = async (settings: Partial<WorkWeekSettings>) => {
    try {
      const updateData: Partial<DatabaseSettings> = {};
      
      if (settings.workDays !== undefined) updateData.work_days = settings.workDays;
      if (settings.hoursPerDay !== undefined) updateData.hours_per_day = settings.hoursPerDay;
      
      await updateSettings(updateData);
      
      setState((prev) => ({
        ...prev,
        workWeekSettings: {
          ...prev.workWeekSettings,
          ...settings,
        },
      }));
      
      return;
    } catch (error) {
      throw error;
    }
  };

  const isAllocated = (employeeId: string, projectId: string) => {
    return state.allocations.some(
      (a) => a.employeeId === employeeId && a.projectId === projectId
    );
  };

  // Helper function to calculate working days between two dates
  function calculateWorkingDays(startDate: Date, endDate: Date, workDays: boolean[]): number {
    let count = 0;
    
    // Ensure we're working with actual Date objects (not just date strings)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Clone the start date to avoid modifying the original
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 6 is Saturday
      if (workDays[dayOfWeek]) {
        count++;
      }
      // Add one day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  }

  const calculateProjectWorkHours = (projectId: string) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return 0;
    
    // Find all allocations for this project
    const projectAllocations = state.allocations.filter(
      (a) => a.projectId === projectId
    );
    
    // If no allocations, return 0
    if (projectAllocations.length === 0) return 0;
    
    try {
      // Count the number of working days between start and end dates
      const workingDays = calculateWorkingDays(
        project.startDate,
        project.endDate,
        state.workWeekSettings.workDays
      );
      
      // Calculate total work hours based on allocations, working days and hours per day
      let totalWorkHours = 0;
      projectAllocations.forEach((allocation) => {
        totalWorkHours += (allocation.percentage / 100) * workingDays * state.workWeekSettings.hoursPerDay;
      });
      
      return Math.round(totalWorkHours);
    } catch (error) {
      console.error("Error calculating project work hours:", error);
      return 0;
    }
  };

  const value = {
    state,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addProject,
    updateProject,
    deleteProject,
    addAllocation,
    updateAllocation,
    deleteAllocation,
    isAllocated,
    updateCompanyLogo,
    updateCompanyName,
    updateWorkWeekSettings,
    calculateProjectWorkHours,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
