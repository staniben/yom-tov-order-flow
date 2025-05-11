
import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { he } from "date-fns/locale";

export default function MonthlyOverview() {
  const { state } = useOfflineAppContext();
  const { employees, projects, allocations } = state;

  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const prevMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const getActiveProjects = () => {
    return projects.filter((project) =>
      isWithinInterval(monthStart, {
        start: project.startDate,
        end: project.endDate,
      }) ||
      isWithinInterval(monthEnd, {
        start: project.startDate,
        end: project.endDate,
      }) ||
      (project.startDate <= monthStart && project.endDate >= monthEnd)
    );
  };

  const getEmployeeProjects = (employeeId: string) => {
    const employeeAllocations = allocations.filter(
      (a) => a.employeeId === employeeId
    );
    
    return employeeAllocations
      .map((allocation) => {
        const project = projects.find((p) => p.id === allocation.projectId);
        if (!project) return null;
        
        const isActive =
          isWithinInterval(monthStart, {
            start: project.startDate,
            end: project.endDate,
          }) ||
          isWithinInterval(monthEnd, {
            start: project.startDate,
            end: project.endDate,
          }) ||
          (project.startDate <= monthStart && project.endDate >= monthEnd);
        
        if (!isActive) return null;
        
        return {
          ...project,
          percentage: allocation.percentage,
        };
      })
      .filter(Boolean);
  };

  const activeProjects = getActiveProjects();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">סקירה חודשית</h1>
        
        <div className="flex items-center space-s-4 rtl:space-s-reverse">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            &raquo; חודש קודם
          </Button>
          
          <h2 className="text-lg font-medium text-pm-blue-700">
            {format(currentMonth, 'MMMM yyyy', { locale: he })}
          </h2>
          
          <Button variant="outline" size="sm" onClick={nextMonth}>
            חודש הבא &laquo;
          </Button>
        </div>
      </div>
      
      {activeProjects.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-lg text-gray-500">אין פרוייקטים פעילים בחודש זה</p>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          {employees.map((employee) => {
            const employeeProjects = getEmployeeProjects(employee.id);
            if (employeeProjects.length === 0) return null;
            
            return (
              <div key={employee.id} className="mb-8 last:mb-0">
                <h3 className="text-lg font-medium text-pm-blue-800 mb-4">
                  {employee.name}
                </h3>
                
                <table className="pm-table w-full mb-4">
                  <thead>
                    <tr>
                      <th className="w-1/3">פרויקט</th>
                      <th className="w-1/3">הזמנת עבודה</th>
                      <th className="w-1/3">אחוז משרה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeProjects.map((project) => (
                      <tr key={project?.id}>
                        <td>{project?.name}</td>
                        <td className="ltr">{`${project?.workOrderPrimary}-${project?.workOrderSecondary}`}</td>
                        <td className="ltr">{project?.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex justify-end mr-4">
                  <div className="bg-gray-100 px-4 py-2 rounded-md">
                    <span className="font-medium text-sm">
                      סה״כ אחוזי משרה: {employeeProjects.reduce((sum, p) => sum + (p?.percentage || 0), 0)}%
                    </span>
                  </div>
                </div>
                
                <hr className="mt-6" />
              </div>
            );
          })}
        </div>
      )}
      
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h2 className="font-medium text-pm-blue-700 mb-2">מקרא:</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• מוצגים רק פרויקטים פעילים בחודש הנבחר</li>
          <li>• רק עובדים המשובצים לפרויקטים פעילים מוצגים בסקירה</li>
          <li>• ניתן לנווט בין החודשים באמצעות הכפתורים למעלה</li>
        </ul>
      </div>
    </div>
  );
}
