
import * as React from "react";
import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";

export default function OfflineProjectsTable() {
  const { 
    state, 
    isLoading, 
    addProject, 
    updateProject, 
    deleteProject, 
    calculateProjectWorkHours 
  } = useOfflineAppContext();
  
  const { projects } = state;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProject, setCurrentProject] = useState<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    workOrderPrimary: string;
    workOrderSecondary: string;
    approvedHours?: number;
    budgetCode?: string;  // Added budget code field
  }>({
    id: "",
    name: "",
    startDate: new Date(),
    endDate: new Date(),
    workOrderPrimary: "",
    workOrderSecondary: "",
    approvedHours: 0,
    budgetCode: "",
  });

  useEffect(() => {
    if (!isDialogOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsDialogOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line
  }, [isDialogOpen, currentProject]);

  const [calendarOpenStart, setCalendarOpenStart] = useState(false);
  const [calendarOpenEnd, setCalendarOpenEnd] = useState(false);

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentProject({
      id: Date.now().toString(),
      name: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      workOrderPrimary: "",
      workOrderSecondary: "",
      approvedHours: 0,
      budgetCode: "", // Added empty budget code
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: typeof currentProject) => {
    setIsEditMode(true);
    setCurrentProject({ ...project });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        await updateProject(currentProject.id, currentProject);
      } else {
        await addProject(currentProject);
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק פרויקט זה?")) {
      try {
        await deleteProject(id);
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const renderWorkOrder = (primary: string, secondary: string) => {
    if (!primary && !secondary) return "";
    if (primary && secondary) return `${primary}\\${secondary}`;
    return primary || secondary || "";
  };

  const isOverloaded = (projectId: string, approvedHours: number | undefined) => {
    if (!approvedHours) return false;
    const calculatedHours = calculateProjectWorkHours(projectId);
    return calculatedHours > approvedHours;
  };
  
  // Excel export functionality
  const exportToExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for export
    const exportData = projects.map(project => {
      const calculatedHours = calculateProjectWorkHours(project.id);
      const overloaded = isOverloaded(project.id, project.approvedHours);
      
      return {
        "שם הפרויקט": project.name,
        "תאריך התחלה": format(project.startDate, "dd/MM/yyyy", { locale: he }),
        "תאריך סיום": format(project.endDate, "dd/MM/yyyy", { locale: he }),
        "הזמנת עבודה": renderWorkOrder(project.workOrderPrimary, project.workOrderSecondary),
        "סת\"ב": project.budgetCode || "",
        "שעות מאושרות": project.approvedHours || 0,
        "שעות מחושבות": calculatedHours,
        "חריגה": overloaded ? "כן" : "לא",
      };
    });
    
    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(exportData, {header: [
      "שם הפרויקט",
      "תאריך התחלה",
      "תאריך סיום",
      "הזמנת עבודה",
      "סת\"ב",
      "שעות מאושרות",
      "שעות מחושבות",
      "חריגה"
    ]});
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "פרויקטים");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `פרויקטים_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
          <table className="pm-table min-w-full table-auto rtl text-right">
            <thead>
              <tr>
                <th className="min-w-[120px]">שם הפרויקט</th>
                <th className="min-w-[100px]">תאריך התחלה</th>
                <th className="min-w-[100px]">תאריך סיום</th>
                <th className="min-w-[120px]">הזמנת עבודה</th>
                <th className="min-w-[100px]">סת"ב</th>
                <th className="min-w-[100px]">שעות מאושרות</th>
                <th className="min-w-[100px]">שעות מחושבות</th>
                <th className="min-w-[80px]">חריגה</th>
                <th className="min-w-[90px]">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {Array(5).fill(0).map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton className="h-6 w-28" /></td>
                  <td><Skeleton className="h-6 w-20" /></td>
                  <td><Skeleton className="h-6 w-20" /></td>
                  <td><Skeleton className="h-6 w-24" /></td>
                  <td><Skeleton className="h-6 w-24" /></td>
                  <td><Skeleton className="h-6 w-16" /></td>
                  <td><Skeleton className="h-6 w-16" /></td>
                  <td><Skeleton className="h-6 w-14" /></td>
                  <td><Skeleton className="h-6 w-20" /></td>
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
        <h1 className="text-2xl font-bold text-gray-800">ניהול פרויקטים</h1>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            ייצוא לקובץ אקסל
          </Button>
          <Button onClick={openAddDialog}>פרויקט חדש</Button>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="pm-table min-w-full table-auto rtl text-right">
          <thead>
            <tr>
              <th className="min-w-[120px]">שם הפרויקט</th>
              <th className="min-w-[100px]">תאריך התחלה</th>
              <th className="min-w-[100px]">תאריך סיום</th>
              <th className="min-w-[120px]">הזמנת עבודה</th>
              <th className="min-w-[100px]">סת"ב</th>
              <th className="min-w-[100px]">שעות מאושרות</th>
              <th className="min-w-[100px]">שעות מחושבות</th>
              <th className="min-w-[80px]">חריגה</th>
              <th className="min-w-[90px]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4 text-gray-500">
                  לא נמצאו פרויקטים
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const calculatedHours = calculateProjectWorkHours(project.id);
                const overloaded = isOverloaded(project.id, project.approvedHours);
                
                return (
                  <tr key={project.id}>
                    <td className="font-medium min-w-[120px]">{project.name}</td>
                    <td className="min-w-[100px]">{format(project.startDate, "dd/MM/yyyy", { locale: he })}</td>
                    <td className="min-w-[100px]">{format(project.endDate, "dd/MM/yyyy", { locale: he })}</td>
                    <td className="ltr min-w-[120px]">{renderWorkOrder(project.workOrderPrimary, project.workOrderSecondary)}</td>
                    <td className="min-w-[100px]">{project.budgetCode || "-"}</td>
                    <td className="min-w-[100px]">{project.approvedHours || 0}</td>
                    <td className="min-w-[100px]">{calculatedHours}</td>
                    <td className="min-w-[80px]">
                      {overloaded && (
                        <div className="flex items-center text-red-500">
                          <AlertTriangle className="h-5 w-5 mr-1" />
                          <span>חריגה</span>
                        </div>
                      )}
                    </td>
                    <td className="min-w-[90px]">
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
                );
              })
            )}
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
                <Popover open={calendarOpenStart} onOpenChange={setCalendarOpenStart}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                      onClick={() => setCalendarOpenStart(true)}
                    >
                      {format(currentProject.startDate, "dd/MM/yyyy", { locale: he })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={currentProject.startDate}
                      onSelect={(date) => {
                        if (date) {
                          setCurrentProject({ ...currentProject, startDate: date });
                          setCalendarOpenStart(false);
                        }
                      }}
                      className="p-3 pointer-events-auto"
                      locale={he}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">תאריך סיום</label>
                <Popover open={calendarOpenEnd} onOpenChange={setCalendarOpenEnd}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-right"
                      onClick={() => setCalendarOpenEnd(true)}
                    >
                      {format(currentProject.endDate, "dd/MM/yyyy", { locale: he })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={currentProject.endDate}
                      onSelect={(date) => {
                        if (date) {
                          setCurrentProject({ ...currentProject, endDate: date });
                          setCalendarOpenEnd(false);
                        }
                      }}
                      className="p-3 pointer-events-auto"
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
                <span className="mx-2">\</span>
                <Input
                  className="ltr"
                  placeholder="001"
                  value={currentProject.workOrderSecondary}
                  onChange={(e) => setCurrentProject({ ...currentProject, workOrderSecondary: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="budget-code" className="text-sm font-medium">
                סת"ב (קוד תקציב)
              </label>
              <Input
                id="budget-code"
                value={currentProject.budgetCode || ""}
                onChange={(e) => setCurrentProject({ 
                  ...currentProject, 
                  budgetCode: e.target.value 
                })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="approved-hours" className="text-sm font-medium">
                שעות מאושרות
              </label>
              <Input
                id="approved-hours"
                type="number"
                min="0"
                value={currentProject.approvedHours || ""}
                onChange={(e) => setCurrentProject({ 
                  ...currentProject, 
                  approvedHours: e.target.value ? Number(e.target.value) : undefined 
                })}
                className="ltr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              ביטול
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  טוען...
                </>
              ) : isEditMode ? "עדכן" : "הוסף"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
