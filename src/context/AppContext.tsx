
import { createContext, useContext, useState, ReactNode } from "react";
import { AppState, Employee, Project, Allocation, WorkWeekSettings } from "@/types";

// Initial mock data
const initialState: AppState = {
  employees: [
    { id: "1", name: "אבי כהן", position: "מהנדס", department: "פיתוח" },
    { id: "2", name: "מיכל לוי", position: "מנהלת פרוייקטים", department: "תפעול" },
    { id: "3", name: "דוד גולן", position: "מעצב", department: "עיצוב" },
    { id: "4", name: "שירה אלון", position: "מפתחת", department: "פיתוח" },
  ],
  projects: [
    {
      id: "1",
      name: "פרויקט תשתיות",
      startDate: new Date(2023, 3, 1),
      endDate: new Date(2023, 8, 30),
      workOrderPrimary: "WT-2023",
      workOrderSecondary: "001",
      approvedHours: 1000,
    },
    {
      id: "2",
      name: "פורטל לקוחות",
      startDate: new Date(2023, 5, 15),
      endDate: new Date(2023, 11, 15),
      workOrderPrimary: "WT-2023",
      workOrderSecondary: "002",
      approvedHours: 800,
    },
    {
      id: "3",
      name: "מערכת ניהול משימות",
      startDate: new Date(2023, 6, 1),
      endDate: new Date(2023, 9, 30),
      workOrderPrimary: "WT-2023",
      workOrderSecondary: "003",
      approvedHours: 1200,
    },
  ],
  allocations: [
    { employeeId: "1", projectId: "1", percentage: 60 },
    { employeeId: "1", projectId: "2", percentage: 40 },
    { employeeId: "2", projectId: "2", percentage: 100 },
    { employeeId: "3", projectId: "3", percentage: 70 },
    { employeeId: "4", projectId: "1", percentage: 50 },
    { employeeId: "4", projectId: "3", percentage: 50 },
  ],
  companyLogo: null,
  companyName: "החברה שלי",
  workWeekSettings: {
    workDays: [true, true, true, true, true, false, false], // Sunday to Thursday by default
    hoursPerDay: 8.5,
  },
};

interface AppContextType {
  state: AppState;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addAllocation: (allocation: Allocation) => void;
  updateAllocation: (employeeId: string, projectId: string, percentage: number) => void;
  deleteAllocation: (employeeId: string, projectId: string) => void;
  isAllocated: (employeeId: string, projectId: string) => boolean;
  updateCompanyLogo: (logoUrl: string) => void;
  updateCompanyName: (name: string) => void;
  updateWorkWeekSettings: (settings: Partial<WorkWeekSettings>) => void;
  calculateProjectWorkHours: (projectId: string) => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const addEmployee = (employee: Employee) => {
    setState((prev) => ({
      ...prev,
      employees: [...prev.employees, employee],
    }));
  };

  const updateEmployee = (id: string, employee: Partial<Employee>) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.map((e) =>
        e.id === id ? { ...e, ...employee } : e
      ),
    }));
  };

  const deleteEmployee = (id: string) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      allocations: prev.allocations.filter((a) => a.employeeId !== id),
    }));
  };

  const addProject = (project: Project) => {
    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...project } : p
      ),
    }));
  };

  const deleteProject = (id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
      allocations: prev.allocations.filter((a) => a.projectId !== id),
    }));
  };

  const addAllocation = (allocation: Allocation) => {
    setState((prev) => ({
      ...prev,
      allocations: [...prev.allocations, allocation],
    }));
  };

  const updateAllocation = (employeeId: string, projectId: string, percentage: number) => {
    setState((prev) => ({
      ...prev,
      allocations: prev.allocations.map((a) =>
        a.employeeId === employeeId && a.projectId === projectId
          ? { ...a, percentage }
          : a
      ),
    }));
  };

  const deleteAllocation = (employeeId: string, projectId: string) => {
    setState((prev) => ({
      ...prev,
      allocations: prev.allocations.filter(
        (a) => !(a.employeeId === employeeId && a.projectId === projectId)
      ),
    }));
  };

  const isAllocated = (employeeId: string, projectId: string) => {
    return state.allocations.some(
      (a) => a.employeeId === employeeId && a.projectId === projectId
    );
  };

  const updateCompanyLogo = (logoUrl: string) => {
    setState((prev) => ({
      ...prev,
      companyLogo: logoUrl
    }));
  };

  const updateCompanyName = (name: string) => {
    setState((prev) => ({
      ...prev,
      companyName: name
    }));
  };

  const updateWorkWeekSettings = (settings: Partial<WorkWeekSettings>) => {
    setState((prev) => ({
      ...prev,
      workWeekSettings: {
        ...prev.workWeekSettings,
        ...settings,
      },
    }));
  };

  const calculateProjectWorkHours = (projectId: string) => {
    const project = state.projects.find((p) => p.id === projectId);
    if (!project) return 0;
    
    // Find all allocations for this project
    const projectAllocations = state.allocations.filter(
      (a) => a.projectId === projectId
    );
    
    // If no allocations, return 0
    if (projectAllocations.length === 0) return 0;
    
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
  };

  // Helper function to calculate working days between two dates
  function calculateWorkingDays(startDate: Date, endDate: Date, workDays: boolean[]): number {
    let count = 0;
    const currentDate = new Date(startDate);
    
    // Ensure we're working with date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
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

  const value = {
    state,
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
