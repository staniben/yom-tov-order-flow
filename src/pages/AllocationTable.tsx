
import { useAppContext } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AllocationTable() {
  const { state, isAllocated, addAllocation, deleteAllocation } = useAppContext();
  const { employees, projects } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [percentage, setPercentage] = useState("100");

  const handleCellClick = (employeeId: string, projectId: string) => {
    if (isAllocated(employeeId, projectId)) {
      // If already allocated, remove the allocation
      if (window.confirm("האם להסיר את השיבוץ?")) {
        deleteAllocation(employeeId, projectId);
      }
    } else {
      // If not allocated, open dialog to add new allocation
      setSelectedEmployee(employeeId);
      setSelectedProject(projectId);
      setIsDialogOpen(true);
    }
  };

  const handleAddAllocation = () => {
    if (selectedEmployee && selectedProject && percentage) {
      addAllocation({
        employeeId: selectedEmployee,
        projectId: selectedProject,
        percentage: parseInt(percentage, 10),
      });
      setIsDialogOpen(false);
      setSelectedEmployee(null);
      setSelectedProject(null);
      setPercentage("100");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">טבלת שיבוץ עובדים לפרויקטים</h1>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="pm-table min-w-full">
          <thead>
            <tr>
              <th className="w-48">עובדים / פרויקטים</th>
              {projects.map((project) => (
                <th key={project.id}>{project.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="font-medium">{employee.name}</td>
                {projects.map((project) => (
                  <td 
                    key={`${employee.id}-${project.id}`}
                    className={`allocation-cell ${isAllocated(employee.id, project.id) ? 'selected' : ''}`}
                    onClick={() => handleCellClick(employee.id, project.id)}
                  >
                    {isAllocated(employee.id, project.id) && (
                      <div className="flex justify-center items-center h-full">
                        <span className="text-sm font-medium text-pm-blue-700">✓</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h2 className="font-medium text-pm-blue-700 mb-2">הוראות שימוש:</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• לחץ על תא בטבלה כדי לשבץ/להסיר עובד לפרויקט</li>
          <li>• בעמוד "אחוזי השקעה" ניתן להגדיר אחוזי משרה לכל שיבוץ</li>
          <li>• ניתן לשבץ עובד למספר פרויקטים, ופרויקט למספר עובדים</li>
        </ul>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת שיבוץ חדש</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="employee" className="text-sm font-medium">
                עובד:
              </label>
              <Input
                id="employee"
                value={selectedEmployee ? employees.find(e => e.id === selectedEmployee)?.name : ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="project" className="text-sm font-medium">
                פרויקט:
              </label>
              <Input
                id="project"
                value={selectedProject ? projects.find(p => p.id === selectedProject)?.name : ''}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="percentage" className="text-sm font-medium">
                אחוז משרה:
              </label>
              <div className="flex items-center">
                <Input
                  id="percentage"
                  type="number"
                  min="1" 
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="ltr"
                />
                <span className="mr-2">%</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              ביטול
            </Button>
            <Button type="button" onClick={handleAddAllocation}>
              הוסף שיבוץ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
