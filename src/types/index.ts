
export interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  workOrderPrimary: string;
  workOrderSecondary: string;
  approvedHours?: number;
  budgetCode?: string; // Added budget code field ("סת"ב")
}

export interface Allocation {
  employeeId: string;
  projectId: string;
  percentage: number;
}

export interface WorkWeekSettings {
  workDays: boolean[];  // Array of 7 booleans representing days from Sunday to Saturday
  hoursPerDay: number;
}

export interface StorageSettings {
  type: 'browser' | 'network';
  networkPath?: string;
}

export interface AppState {
  employees: Employee[];
  projects: Project[];
  allocations: Allocation[];
  companyLogo: string | null;
  companyName: string;
  workWeekSettings: WorkWeekSettings;
  storageSettings: StorageSettings;
}
