
import { DatabaseEmployee, DatabaseProject, DatabaseAllocation, DatabaseSettings } from "@/integrations/supabase/database.types";
import { isElectron, electronAPI } from "@/utils/electron";
import { toast } from "@/components/ui/use-toast";

type LocalStorageOptions = {
  storageType: 'browser' | 'network';
  networkPath?: string;
};

export type QueryResponse<T> = {
  data: T | null;
  error: Error | null;
};

export class LocalStorageAdapter {
  private options: LocalStorageOptions;
  private readonly EMPLOYEES_KEY = 'offline_employees';
  private readonly PROJECTS_KEY = 'offline_projects';
  private readonly ALLOCATIONS_KEY = 'offline_allocations';
  private readonly SETTINGS_KEY = 'offline_settings';

  constructor(options: LocalStorageOptions) {
    this.options = options;
  }

  // Update adapter options
  updateOptions(options: LocalStorageOptions): void {
    this.options = options;
    // Save the options to localStorage for persistence
    localStorage.setItem('storage_options', JSON.stringify(options));
  }

  // Get stored options from localStorage
  static getStoredOptions(): LocalStorageOptions {
    const storedOptions = localStorage.getItem('storage_options');
    return storedOptions 
      ? JSON.parse(storedOptions) 
      : { storageType: 'browser' };
  }

  // Generic methods for data access
  private async getData<T>(key: string): Promise<T[]> {
    // If network storage is selected and we have a path
    if (this.options.storageType === 'network' && this.options.networkPath) {
      try {
        // Check if we're running in Electron
        if (isElectron()) {
          // Use Electron's IPC to read from file system
          const filePath = `${this.options.networkPath}/${key}.json`;
          const result = await electronAPI.readFile(filePath);
          
          if (result.success && result.data) {
            return JSON.parse(result.data);
          } else {
            // If file doesn't exist yet, return empty array
            if (result.error?.includes('ENOENT')) {
              return [];
            }
            
            // Log the error
            console.error(`Error reading from network storage: ${result.error}`);
            
            // Fall back to browser storage on error
            console.warn('Falling back to browser storage due to network storage error');
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
          }
        } else {
          // Running in browser but network storage selected
          console.warn('Network storage selected but running in browser. Falling back to browser storage.');
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : [];
        }
      } catch (error) {
        console.error('Error with network storage operations:', error);
        // Fall back to browser storage on error
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      }
    }
    
    // Default to browser storage
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private async setData<T>(key: string, data: T[]): Promise<void> {
    // If network storage is selected and we have a path
    if (this.options.storageType === 'network' && this.options.networkPath) {
      try {
        // Check if we're running in Electron
        if (isElectron()) {
          // Use Electron's IPC to write to file system
          const filePath = `${this.options.networkPath}/${key}.json`;
          const jsonData = JSON.stringify(data, null, 2);
          const result = await electronAPI.writeFile(filePath, jsonData);
          
          if (!result.success) {
            console.error(`Error writing to network storage: ${result.error}`);
            // Fall back to browser storage on error
            console.warn('Falling back to browser storage due to network storage error');
            localStorage.setItem(key, JSON.stringify(data));
          }
          return;
        } else {
          // Running in browser but network storage selected
          console.warn('Network storage selected but running in browser. Falling back to browser storage.');
          localStorage.setItem(key, JSON.stringify(data));
          return;
        }
      } catch (error) {
        console.error('Error with network storage operations:', error);
        // Fall back to browser storage on error
        localStorage.setItem(key, JSON.stringify(data));
      }
    }

    // Default to browser storage
    localStorage.setItem(key, JSON.stringify(data));
  }

  // CRUD operations for employees
  async getEmployees(): Promise<QueryResponse<DatabaseEmployee[]>> {
    try {
      const employees = await this.getData<DatabaseEmployee>(this.EMPLOYEES_KEY);
      return { data: employees, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addEmployee(employee: Omit<DatabaseEmployee, 'id' | 'created_at'>): Promise<QueryResponse<DatabaseEmployee>> {
    try {
      const employees = await this.getData<DatabaseEmployee>(this.EMPLOYEES_KEY);
      const newEmployee: DatabaseEmployee = {
        id: crypto.randomUUID(),
        name: employee.name,
        position: employee.position || null,
        department: employee.department || null,
        created_at: new Date().toISOString(),
      };

      employees.push(newEmployee);
      await this.setData(this.EMPLOYEES_KEY, employees);
      return { data: newEmployee, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateEmployee(id: string, updates: Partial<DatabaseEmployee>): Promise<QueryResponse<null>> {
    try {
      const employees = await this.getData<DatabaseEmployee>(this.EMPLOYEES_KEY);
      const index = employees.findIndex(e => e.id === id);
      
      if (index !== -1) {
        employees[index] = { ...employees[index], ...updates };
        await this.setData(this.EMPLOYEES_KEY, employees);
      }
      
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteEmployee(id: string): Promise<QueryResponse<null>> {
    try {
      const employees = await this.getData<DatabaseEmployee>(this.EMPLOYEES_KEY);
      const filtered = employees.filter(e => e.id !== id);
      await this.setData(this.EMPLOYEES_KEY, filtered);
      
      // Also delete related allocations
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      const filteredAllocations = allocations.filter(a => a.employee_id !== id);
      await this.setData(this.ALLOCATIONS_KEY, filteredAllocations);
      
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // CRUD operations for projects
  async getProjects(): Promise<QueryResponse<DatabaseProject[]>> {
    try {
      const projects = await this.getData<DatabaseProject>(this.PROJECTS_KEY);
      return { data: projects, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addProject(project: Omit<DatabaseProject, 'id' | 'created_at'>): Promise<QueryResponse<DatabaseProject>> {
    try {
      const projects = await this.getData<DatabaseProject>(this.PROJECTS_KEY);
      const newProject: DatabaseProject = {
        id: crypto.randomUUID(),
        name: project.name,
        start_date: project.start_date,
        end_date: project.end_date,
        work_order_primary: project.work_order_primary,
        work_order_secondary: project.work_order_secondary,
        approved_hours: project.approved_hours,
        budget_code: project.budget_code,
        created_at: new Date().toISOString(),
      };

      projects.push(newProject);
      await this.setData(this.PROJECTS_KEY, projects);
      return { data: newProject, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateProject(id: string, updates: Partial<DatabaseProject>): Promise<QueryResponse<null>> {
    try {
      const projects = await this.getData<DatabaseProject>(this.PROJECTS_KEY);
      const index = projects.findIndex(p => p.id === id);
      
      if (index !== -1) {
        projects[index] = { ...projects[index], ...updates };
        await this.setData(this.PROJECTS_KEY, projects);
      }
      
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteProject(id: string): Promise<QueryResponse<null>> {
    try {
      const projects = await this.getData<DatabaseProject>(this.PROJECTS_KEY);
      const filtered = projects.filter(p => p.id !== id);
      await this.setData(this.PROJECTS_KEY, filtered);
      
      // Also delete related allocations
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      const filteredAllocations = allocations.filter(a => a.project_id !== id);
      await this.setData(this.ALLOCATIONS_KEY, filteredAllocations);
      
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // CRUD operations for allocations
  async getAllocations(): Promise<QueryResponse<DatabaseAllocation[]>> {
    try {
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      return { data: allocations, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async addAllocation(allocation: Omit<DatabaseAllocation, 'id' | 'created_at'>): Promise<QueryResponse<null>> {
    try {
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      const newAllocation: DatabaseAllocation = {
        id: crypto.randomUUID(),
        employee_id: allocation.employee_id,
        project_id: allocation.project_id,
        percentage: allocation.percentage,
        created_at: new Date().toISOString(),
      };

      allocations.push(newAllocation);
      await this.setData(this.ALLOCATIONS_KEY, allocations);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateAllocation(
    employeeId: string, 
    projectId: string, 
    percentage: number
  ): Promise<QueryResponse<null>> {
    try {
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      const index = allocations.findIndex(
        a => a.employee_id === employeeId && a.project_id === projectId
      );
      
      if (index !== -1) {
        allocations[index].percentage = percentage;
        await this.setData(this.ALLOCATIONS_KEY, allocations);
      }
      
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async deleteAllocation(
    employeeId: string, 
    projectId: string
  ): Promise<QueryResponse<null>> {
    try {
      const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
      const filtered = allocations.filter(
        a => !(a.employee_id === employeeId && a.project_id === projectId)
      );
      
      await this.setData(this.ALLOCATIONS_KEY, filtered);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Settings operations
  async getSettings(): Promise<QueryResponse<DatabaseSettings | null>> {
    try {
      const settings = await this.getData<DatabaseSettings>(this.SETTINGS_KEY);
      return { data: settings.length > 0 ? settings[0] : null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateSettings(updates: Partial<DatabaseSettings>): Promise<QueryResponse<null>> {
    try {
      const settings = await this.getData<DatabaseSettings>(this.SETTINGS_KEY);
      
      if (settings.length > 0) {
        settings[0] = { ...settings[0], ...updates };
      } else {
        settings.push({
          id: crypto.randomUUID(),
          company_name: updates.company_name || 'החברה שלי',
          company_logo: updates.company_logo || null,
          work_days: updates.work_days || [true, true, true, true, true, false, false],
          hours_per_day: updates.hours_per_day || 8.5,
          storage_type: updates.storage_type || 'browser',
          network_path: updates.network_path || null
        });
      }
      
      await this.setData(this.SETTINGS_KEY, settings);
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Import/Export methods for data backup and restoration
  async exportAllData(): Promise<string> {
    const employees = await this.getData<DatabaseEmployee>(this.EMPLOYEES_KEY);
    const projects = await this.getData<DatabaseProject>(this.PROJECTS_KEY);
    const allocations = await this.getData<DatabaseAllocation>(this.ALLOCATIONS_KEY);
    const settings = await this.getData<DatabaseSettings>(this.SETTINGS_KEY);
    
    const allData = {
      employees,
      projects,
      allocations,
      settings,
    };
    
    return JSON.stringify(allData);
  }

  async importAllData(jsonData: string): Promise<boolean> {
    try {
      const parsedData = JSON.parse(jsonData);
      
      if (parsedData.employees) {
        await this.setData(this.EMPLOYEES_KEY, parsedData.employees);
      }
      
      if (parsedData.projects) {
        await this.setData(this.PROJECTS_KEY, parsedData.projects);
      }
      
      if (parsedData.allocations) {
        await this.setData(this.ALLOCATIONS_KEY, parsedData.allocations);
      }
      
      if (parsedData.settings) {
        await this.setData(this.SETTINGS_KEY, parsedData.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
