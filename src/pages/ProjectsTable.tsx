
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useState } from "react";

export default function ProjectsTable() {
  const { state, addProject, updateProject, deleteProject } = useAppContext();
  const { projects } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    workOrderPrimary: string;
    workOrderSecondary: string;
  }>({
    id: "",
    name: "",
    startDate: new Date(),
    endDate: new Date(),
    workOrderPrimary: "",
    workOrderSecondary: "",
  });

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentProject({
      id: Date.now().toString(),
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      workOrderPrimary: "",
      workOrderSecondary: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: typeof currentProject) => {
    setIsEditMode(true);
    setCurrentProject({ ...project });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (isEditMode) {
      updateProject(currentProject.id, currentProject);
    } else {
      addProject(currentProject);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק פרויקט זה?")) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">ניהול פרויקטים</h1>
        <Button onClick={openAddDialog}>פרויקט חדש</Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="pm-table min-w-full">
          <thead>
            <tr>
              <th>שם הפרויקט</th>
              <th>תאריך התחלה</th>
              <th>תאריך סיום</th>
              <th>הזמנת עבודה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="font-medium">{project.name}</td>
                <td>{format(project.startDate, 'dd/MM/yyyy', { locale: he })}</td>
                <td>{format(project.endDate, 'dd/MM/yyyy', { locale: he })}</td>
                <td className="ltr">{`${project.workOrderPrimary}-${project.workOrderSecondary}`}</td>
                <td>
                  <div className="flex space-s-2 rtl:space-s-reverse">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openEditDialog(project)}
                    >
                      ערוך
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDelete(project.id)}
                    >
                      מחק
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "עריכת פרויקט" : "הוספת פרויקט חדש"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">
                שם הפרויקט
              </label>
              <Input
                id="project-name"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך התחלה</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                    >
                      {format(currentProject.startDate, 'dd/MM/yyyy', { locale: he })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={currentProject.startDate}
                      onSelect={(date) => date && setCurrentProject({ ...currentProject, startDate: date })}
                      className="p-3"
                      locale={he}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך סיום</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                    >
                      {format(currentProject.endDate, 'dd/MM/yyyy', { locale: he })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={currentProject.endDate}
                      onSelect={(date) => date && setCurrentProject({ ...currentProject, endDate: date })}
                      className="p-3"
                      locale={he}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">הזמנת עבודה</label>
              <div className="flex items-center space-s-2 rtl:space-s-reverse">
                <Input
                  className="ltr"
                  placeholder="WT-2023"
                  value={currentProject.workOrderPrimary}
                  onChange={(e) => setCurrentProject({ ...currentProject, workOrderPrimary: e.target.value })}
                />
                <span className="mx-2">-</span>
                <Input
                  className="ltr"
                  placeholder="001"
                  value={currentProject.workOrderSecondary}
                  onChange={(e) => setCurrentProject({ ...currentProject, workOrderSecondary: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              ביטול
            </Button>
            <Button type="button" onClick={handleSave}>
              {isEditMode ? "עדכן" : "הוסף"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
