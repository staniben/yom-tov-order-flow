
import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AllocationPercentage() {
  const { state, updateAllocation } = useOfflineAppContext();
  const { employees, projects, allocations } = state;

  const [editingAllocation, setEditingAllocation] = useState<{
    employeeId: string;
    projectId: string;
    percentage: number;
  } | null>(null);

  const getEmployeeAllocations = (employeeId: string) => {
    return allocations.filter((a) => a.employeeId === employeeId);
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const handleEdit = (allocation: typeof editingAllocation) => {
    setEditingAllocation(allocation);
  };

  const handleSave = () => {
    if (editingAllocation) {
      updateAllocation(
        editingAllocation.employeeId,
        editingAllocation.projectId,
        editingAllocation.percentage
      );
      setEditingAllocation(null);
    }
  };

  const handleCancel = () => {
    setEditingAllocation(null);
  };

  const getTotalPercentage = (employeeId: string) => {
    return allocations
      .filter((a) => a.employeeId === employeeId)
      .reduce((sum, allocation) => sum + allocation.percentage, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">הקצאת אחוזי משרה</h1>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        {employees.map((employee) => {
          const employeeAllocations = getEmployeeAllocations(employee.id);
          const totalPercentage = getTotalPercentage(employee.id);
          const hasAllocations = employeeAllocations.length > 0;
          
          return (
            <div key={employee.id} className="mb-6 last:mb-0">
              <h2 className="text-lg font-medium text-gray-800 mb-2">{employee.name}</h2>
              
              {!hasAllocations && (
                <p className="text-gray-500 text-sm italic">לא נמצאו שיבוצים לעובד זה</p>
              )}
              
              {hasAllocations && (
                <>
                  <table className="w-full mb-2">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right pb-2">פרויקט</th>
                        <th className="text-right pb-2">אחוז משרה</th>
                        <th className="text-right pb-2">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeAllocations.map((allocation) => (
                        <tr key={`${allocation.employeeId}-${allocation.projectId}`} className="border-b">
                          <td className="py-2">
                            {getProject(allocation.projectId)?.name}
                          </td>
                          <td className="py-2">
                            {editingAllocation?.employeeId === allocation.employeeId && 
                             editingAllocation?.projectId === allocation.projectId ? (
                              <div className="flex items-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  className="w-20 ltr"
                                  value={editingAllocation.percentage}
                                  onChange={(e) => 
                                    setEditingAllocation({
                                      ...editingAllocation,
                                      percentage: parseInt(e.target.value, 10) || 0
                                    })
                                  }
                                />
                                <span className="mr-2">%</span>
                              </div>
                            ) : (
                              <span className="ltr">{allocation.percentage}%</span>
                            )}
                          </td>
                          <td className="py-2">
                            {editingAllocation?.employeeId === allocation.employeeId && 
                             editingAllocation?.projectId === allocation.projectId ? (
                              <div className="flex space-x-2 space-x-reverse">
                                <Button size="sm" variant="outline" onClick={handleSave}>
                                  שמור
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleCancel}>
                                  ביטול
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleEdit(allocation)}
                              >
                                ערוך
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end items-center mt-2 text-sm">
                    <span 
                      className={`font-medium ${totalPercentage > 100 ? 'text-red-600' : 'text-gray-800'}`}
                    >
                      סה"כ: {totalPercentage}%
                    </span>
                    {totalPercentage > 100 && (
                      <span className="text-red-600 mr-2">
                        (חריגה של {totalPercentage - 100}%)
                      </span>
                    )}
                  </div>
                </>
              )}
              
              <hr className="mt-4" />
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h2 className="font-medium text-pm-blue-700 mb-2">שים לב:</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• סה"כ אחוזי משרה של עובד יכולים להיות בין 1% ל-100%</li>
          <li>• חריגה מעל 100% תסומן באדום</li>
          <li>• ניתן לערוך את אחוזי המשרה על ידי לחיצה על "ערוך"</li>
        </ul>
      </div>
    </div>
  );
}
