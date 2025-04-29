
import { supabase } from "@/integrations/supabase/client";
import { AppState } from "@/types";

// This function can be called from the main app to migrate local data to Supabase
export async function migrateLocalDataToSupabase(localState: AppState) {
  try {
    // Step 1: Add settings
    const { error: settingsError } = await supabase
      .from('settings')
      .upsert({
        company_name: localState.companyName || 'החברה שלי',
        company_logo: localState.companyLogo,
        work_days: localState.workWeekSettings.workDays,
        hours_per_day: localState.workWeekSettings.hoursPerDay
      });
    
    if (settingsError) throw settingsError;
    
    // Step 2: Add employees
    if (localState.employees.length > 0) {
      const employeesToInsert = localState.employees.map(employee => ({
        id: employee.id,  // Use the existing IDs
        name: employee.name,
        position: employee.position || null,
        department: employee.department || null
      }));
      
      const { error: employeesError } = await supabase
        .from('employees')
        .upsert(employeesToInsert);
      
      if (employeesError) throw employeesError;
    }
    
    // Step 3: Add projects
    if (localState.projects.length > 0) {
      const projectsToInsert = localState.projects.map(project => ({
        id: project.id,  // Use the existing IDs
        name: project.name,
        start_date: project.startDate.toISOString().split('T')[0],
        end_date: project.endDate.toISOString().split('T')[0],
        work_order_primary: project.workOrderPrimary,
        work_order_secondary: project.workOrderSecondary,
        approved_hours: project.approvedHours || null
      }));
      
      const { error: projectsError } = await supabase
        .from('projects')
        .upsert(projectsToInsert);
      
      if (projectsError) throw projectsError;
    }
    
    // Step 4: Add allocations
    if (localState.allocations.length > 0) {
      const allocationsToInsert = localState.allocations.map(allocation => ({
        employee_id: allocation.employeeId,
        project_id: allocation.projectId,
        percentage: allocation.percentage
      }));
      
      const { error: allocationsError } = await supabase
        .from('allocations')
        .upsert(allocationsToInsert, { onConflict: 'employee_id,project_id' });
      
      if (allocationsError) throw allocationsError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, error };
  }
}
