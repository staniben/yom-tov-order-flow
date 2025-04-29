
import { useAppContext } from "@/context/AppContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function AllocationTable() {
  const { state, isLoading, isAllocated, addAllocation, deleteAllocation } = useAppContext();
  const { employees, projects } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [percentage, setPercentage] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isDialogOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddAllocation();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, percentage, selectedEmployee, selectedProject]);

  const handleCellClick = async (employeeId: string, projectId: string) => {
    if (isAllocated(employeeId, projectId)) {
      try {
        await deleteAllocation(employeeId, projectId);
        
        toast({
          title: "השיבוץ הוסר",
          description: "השיבוץ הוסר בהצלחה",
        });
      } catch (error) {
        console.error("Error removing allocation:", error);
      }
    } else {
      setSelectedEmployee(employeeId);
      setSelectedProject(projectId);
      setIsDialogOpen(true);
    }
  };

  const handleAddAllocation = async () => {
    if (selectedEmployee && selectedProject && percentage) {
      const parsedPercentage = parseInt(percentage, 10);
      
      if (isNaN(parsedPercentage) || parsedPercentage <= 0 || parsedPercentage > 100) {
        toast({
          title: "שגיאה",
          description: "אחוז המשרה חייב להיות בין 1 ל-100",
          variant: "destructive",
        });
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        await addAllocation({
          employeeId: selectedEmployee,
          projectId: selectedProject,
          percentage: parsedPercentage,
        });
        
        setIsDialogOpen(false);
        setSelectedEmployee(null);
        setSelectedProject(null);
        setPercentage("100");
        
        toast({
          title: "שיבוץ נוסף",
          description: "עובד שובץ לפרויקט בהצלחה",
        });
      } catch (error) {
        console.error("Error adding allocation:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <table className="pm-table min-w-full table-auto rtl text-right">
            <thead>
              <tr>
                <th className="w-48 min-w-[120px]">עובדים / פרויקטים</th>
                {Array(4).fill(0).map((_, idx) => (
                  <th key={idx} className="min-w-[100px] px-3">
                    <Skeleton className="h-6 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(0).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  <td className="font-medium min-w-[120px]">
                    <Skeleton className="h-6 w-28" />
                  </td>
                  {Array(4).fill(0).map((_, cellIdx) => (
                    <td key={cellIdx} className="min-w-[80px]">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">טבלת שיבוץ עובדים לפרויקטים</h1>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="pm-table min-w-full table-auto rtl text-right">
          <thead>
            <tr>
              <th className="w-48 min-w-[120px]">עובדים / פרויקטים</th>
              {projects.map((project) => (
                <th key={project.id} className="min-w-[100px] px-3">{project.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 || projects.length === 0 ? (
              <tr>
                <td colSpan={projects.length + 1} className="text-center py-4 text-gray-500">
                  {employees.length === 0 ? "לא נמצאו עובדים" : "לא נמצאו פרויקטים"}
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="font-medium min-w-[120px]">{employee.name}</td>
                  {projects.map((project) => (
                    <td
                      key={`${employee.id}-${project.id}`}
                      className={`allocation-cell ${isAllocated(employee.id, project.id) ? "selected" : ""} cursor-pointer min-w-[80px]`}
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
              ))
            )}
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
              <label htmlFor="employee" className="text-sm font-medium">עובד:</label>
              <Input
                id="employee"
                value={selectedEmployee ? employees.find(e => e.id === selectedEmployee)?.name : ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="project" className="text-sm font-medium">פרויקט:</label>
              <Input
                id="project"
                value={selectedProject ? projects.find(p => p.id === selectedProject)?.name : ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="percentage" className="text-sm font-medium">אחוז משרה:</label>
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
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="button" onClick={handleAddAllocation} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  מוסיף...
                </>
              ) : "הוסף שיבוץ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
