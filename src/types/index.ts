
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
}

export interface Allocation {
  employeeId: string;
  projectId: string;
  percentage: number;
}

export interface AppState {
  employees: Employee[];
  projects: Project[];
  allocations: Allocation[];
  companyLogo: string | null;
  companyName: string;
}
