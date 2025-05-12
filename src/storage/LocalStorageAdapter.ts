
import { DatabaseEmployee, DatabaseProject, DatabaseAllocation, DatabaseSettings } from "@/integrations/supabase/database.types";
import path from 'path';

type LocalStorageOptions = {
  storageType: 'browser' | 'network';
  networkPath?: string;
};

export type QueryResponse<T> = {
  data: T | null;
  error: Error | null;
};

// Check if we're running in Electron
const isElectron = () => {
  return window && window.electronAPI !== undefined;
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

  // Build a file path for storage files
  private getFilePath(key: string): string {
    if (!this.options.networkPath) return '';
    return path.join(this.options.networkPath, `${key}.json`);
  }

  // Generic methods for data access
  private async getData<T>(key: string): Promise<T[]> {
    // If we're in Electron and using network storage
    if (isElectron() && this.options.storageType === 'network' && this.options.networkPath) {
      try {
        console.log(`Fetching data from network path: ${this.options.networkPath} for key: ${key}`);
        const filePath = this.getFilePath(key);
        
        // Check if path exists
        const pathCheck = await window.electronAPI.checkPathExists(this.options.networkPath);
        if (!pathCheck.exists) {
          console.error(`Network path does not exist or is not accessible: ${this.options.networkPath}`);
          console.log('Falling back to browser localStorage');
          return this.getBrowserData<T>(key);
        }
        
        // Try to read the file
        const result = await window.electronAPI.readFile(filePath);
        if (result.error) {
          console.error(`Error reading file ${filePath}:`, result.error);
          return this.getBrowserData<T>(key);
        }
        
        // Parse the data
        return result.data ? JSON.parse(result.data) : [];
      } catch (error) {
        console.error(`Error accessing network storage for ${key}:`, error);
        console.log('Falling back to browser localStorage');
        return this.getBrowserData<T>(key);
      }
    } else {
      // Fallback to browser storage if not in Electron or not using network storage
      return this.getBrowserData<T>(key);
    }
  }

  private async setData<T>(key: string, data: T[]): Promise<void> {
    // If we're in Electron and using network storage
    if (isElectron() && this.options.storageType === 'network' && this.options.networkPath) {
      try {
        console.log(`Saving data to network path: ${this.options.networkPath} for key: ${key}`);
        const filePath = this.getFilePath(key);
        
        // Check if path exists
        const pathCheck = await window.electronAPI.checkPathExists(this.options.networkPath);
        if (!pathCheck.exists) {
          console.error(`Network path does not exist or is not accessible: ${this.options.networkPath}`);
          console.log('Falling back to browser localStorage');
          this.setBrowserData(key, data);
          return;
        }
        
        // Try to write the file
        const jsonData = JSON.stringify(data, null, 2);
        const result = await window.electronAPI.writeFile(filePath, jsonData);
        
        if (result.error) {
          console.error(`Error writing file ${filePath}:`, result.error);
          this.setBrowserData(key, data);
          return;
        }
      } catch (error) {
        console.error(`Error accessing network storage for ${key}:`, error);
        console.log('Falling back to browser localStorage');
        this.setBrowserData(key, data);
      }
    } else {
      // Fallback to browser storage if not in Electron or not using network storage
      this.setBrowserData(key, data);
    }
  }

  // Browser storage methods used for fallback
  private getBrowserData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setBrowserData<T>(key: string, data: T[]): void {
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

// Add TypeScript interface for the Electron API
declare global {
  interface Window {
    electronAPI?: {
      checkPathExists: (path: string) => Promise<{exists: boolean, error: string | null}>;
      readFile: (path: string) => Promise<{data: string | null, error: string | null}>;
      writeFile: (path: string, data: string) => Promise<{success: boolean, error: string | null}>;
      selectFolder: () => Promise<{path: string | null}>;
    }
  }
}
