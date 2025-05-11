
export type DatabaseEmployee = {
  id: string;
  name: string;
  position: string | null;
  department: string | null;
  created_at: string;
};

export type DatabaseProject = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  work_order_primary: string;
  work_order_secondary: string;
  approved_hours: number | null;
  budget_code: string | null; // Added budget code field ("סת"ב")
  created_at: string;
};

export type DatabaseAllocation = {
  id: string;
  employee_id: string;
  project_id: string;
  percentage: number;
  created_at: string;
};

export type DatabaseSettings = {
  id: string;
  company_name: string;
  company_logo: string | null;
  work_days: boolean[];
  hours_per_day: number;
  storage_type: 'browser' | 'network'; // Added storage type configuration
  network_path: string | null; // Added network path configuration
};
