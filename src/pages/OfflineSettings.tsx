import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Upload, FolderOpen } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import WorkWeekSettings from "@/components/WorkWeekSettings";
import { Skeleton } from "@/components/ui/skeleton";
import DataBackupModal from "@/components/DataBackupModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { isElectron, electronAPI } from "@/utils/electron";

export default function OfflineSettings() {
  const { state, isLoading, addEmployee, updateEmployee, deleteEmployee, updateCompanyLogo, updateCompanyName, updateStorageSettings } = useOfflineAppContext();
  const { employees, companyLogo, companyName, storageSettings } = state;

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    department: "",
  });

  const [editingEmployee, setEditingEmployee] = useState<{
    id: string;
    name: string;
    position: string;
    department: string;
  } | null>(null);

  const [systemSettings, setSystemSettings] = useState({
    companyName: companyName || "",
    storageType: storageSettings.type || "browser",
    networkPath: storageSettings.networkPath || "",
  });

  // Flag to check if app is running in Electron
  const [isElectronEnv, setIsElectronEnv] = useState(false);
  
  // Update system settings when companyName or storageSettings change from state
  useEffect(() => {
    setSystemSettings({ 
      companyName: companyName || "",
      storageType: storageSettings.type || "browser",
      networkPath: storageSettings.networkPath || "",
    });
    
    // Check if app is running in Electron
    setIsElectronEnv(isElectron());
  }, [companyName, storageSettings]);

  const handleAddEmployee = async () => {
    if (newEmployee.name) {
      try {
        await addEmployee({
          name: newEmployee.name,
          position: newEmployee.position,
          department: newEmployee.department,
        });
        
        setNewEmployee({ name: "", position: "", department: "" });
        
        toast({
          title: "עובד נוסף",
          description: `${newEmployee.name} נוסף בהצלחה`,
        });
      } catch (error) {
        console.error("Error adding employee:", error);
      }
    }
  };

  const handleEditEmployee = async () => {
    if (editingEmployee) {
      try {
        await updateEmployee(editingEmployee.id, editingEmployee);
        setEditingEmployee(null);
        
        toast({
          title: "עובד עודכן",
          description: "פרטי העובד עודכנו בהצלחה",
        });
      } catch (error) {
        console.error("Error updating employee:", error);
      }
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עובד זה?")) {
      try {
        await deleteEmployee(id);
        
        toast({
          title: "עובד נמחק",
          description: "העובד הוסר מהמערכת בהצלחה",
          variant: "destructive",
        });
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  // Folder selection dialog handler
  const handleSelectFolder = async () => {
    try {
      if (!isElectronEnv) {
        toast({
          title: "אפשרות לא זמינה",
          description: "בחירת תיקייה זמינה רק בגרסת שולחן העבודה של האפליקציה",
          variant: "destructive",
        });
        return;
      }
      
      const result = await electronAPI.selectFolder();
      
      if (result.success && result.folderPath) {
        // Update the form state
        setSystemSettings({
          ...systemSettings,
          networkPath: result.folderPath,
          storageType: 'network'
        });
        
        toast({
          title: "תיקייה נבחרה",
          description: `התיקייה ${result.folderPath} נבחרה בהצלחה`,
        });
      } else if (result.canceled) {
        // User canceled folder selection
        console.log('Folder selection canceled');
      } else if (result.error) {
        toast({
          title: "שגיאה בבחירת תיקייה",
          description: `אירעה שגיאה: ${result.error}`,
          variant: "destructive",
        });
        console.error('Folder selection error:', result.error, result.details);
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה לא צפויה",
        variant: "destructive",
      });
      console.error('Unexpected folder selection error:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast({
        title: "סוג קובץ לא נתמך",
        description: "יש להעלות קובץ תמונה בלבד (PNG, JPG, SVG)",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        try {
          await updateCompanyLogo(event.target.result as string);
          
          toast({
            title: "לוגו הועלה",
            description: "הלוגו נשמר בהצלחה",
          });
        } catch (error) {
          console.error("Error updating logo:", error);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    try {
      await updateCompanyName(systemSettings.companyName);
      
      await updateStorageSettings({
        type: systemSettings.storageType as 'browser' | 'network',
        networkPath: systemSettings.storageType === 'network' ? systemSettings.networkPath : undefined
      });
      
      toast({
        title: "הגדרות נשמרו",
        description: "הגדרות המערכת עודכנו בהצלחה",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
        </div>
        
        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid grid-cols-4 bg-gradient-to-r from-pm-blue-100 to-pm-blue-50">
            <TabsTrigger value="employees" className="data-[state=active]:bg-white">ניהול עובדים</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-white">הגדרות מערכת</TabsTrigger>
            <TabsTrigger value="storage" className="data-[state=active]:bg-white">הגדרות אחסון</TabsTrigger>
            <TabsTrigger value="workweek" className="data-[state=active]:bg-white">שבוע עבודה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees" className="space-y-6 pt-4">
            <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {Array(3).fill(0).map((_, idx) => (
                  <Skeleton key={idx} className="h-10 w-full" />
                ))}
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                {Array(5).fill(0).map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full" />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">הגדרות</h1>
      </div>
      
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid grid-cols-4 bg-gradient-to-r from-pm-blue-100 to-pm-blue-50">
          <TabsTrigger value="employees" className="data-[state=active]:bg-white">ניהול עובדים</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-white">הגדרות מערכת</TabsTrigger>
          <TabsTrigger value="storage" className="data-[state=active]:bg-white">הגדרות אחסון</TabsTrigger>
          <TabsTrigger value="workweek" className="data-[state=active]:bg-white">שבוע עבודה</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="space-y-6 pt-4">
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-pm-blue-700">הוספת עובד חדש</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם העובד*</label>
                <Input
                  placeholder="ישראל ישראלי"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="border-gray-300 focus:border-pm-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">תפקיד</label>
                <Input
                  placeholder="מהנדס תוכנה"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  className="border-gray-300 focus:border-pm-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">מחלקה</label>
                <Input
                  placeholder="פיתוח"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="border-gray-300 focus:border-pm-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={handleAddEmployee} className="bg-gradient-to-r from-pm-blue-600 to-pm-blue-700 hover:from-pm-blue-700 hover:to-pm-blue-800">
                הוסף עובד
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-pm-blue-700">רשימת עובדים</h2>
            
            <div className="overflow-x-auto">
              <table className="pm-table w-full">
                <thead className="bg-gradient-to-r from-pm-blue-700 to-pm-blue-600">
                  <tr>
                    <th>שם</th>
                    <th>תפקיד</th>
                    <th>מחלקה</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className="border-b border-gray-200 hover:bg-blue-50">
                      <td>
                        {editingEmployee?.id === employee.id ? (
                          <Input
                            value={editingEmployee.name}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                          />
                        ) : (
                          employee.name
                        )}
                      </td>
                      <td>
                        {editingEmployee?.id === employee.id ? (
                          <Input
                            value={editingEmployee.position || ""}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, position: e.target.value })}
                          />
                        ) : (
                          employee.position || "-"
                        )}
                      </td>
                      <td>
                        {editingEmployee?.id === employee.id ? (
                          <Input
                            value={editingEmployee.department || ""}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                          />
                        ) : (
                          employee.department || "-"
                        )}
                      </td>
                      <td>
                        <div className="flex space-s-2 rtl:space-s-reverse">
                          {editingEmployee?.id === employee.id ? (
                            <>
                              <Button size="sm" variant="outline" onClick={handleEditEmployee}>
                                שמור
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingEmployee(null)}>
                                ביטול
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="hover:bg-blue-100"
                                onClick={() => setEditingEmployee({ ...employee, position: employee.position || "", department: employee.department || "" })}
                              >
                                ערוך
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                מחק
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="system" className="pt-4">
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-pm-blue-700">הגדרות כלליות</h2>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם החברה</label>
                <Input 
                  placeholder="החברה שלי בע״מ" 
                  value={systemSettings.companyName}
                  onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                  className="border-gray-300 focus:border-pm-blue-500"
                />
              </div>
              
              <div className="space-y-4">
                <label className="text-sm font-medium">לוגו החבר��</label>
                
                {companyLogo ? (
                  <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg">
                    <img src={companyLogo} alt="לוגו החברה" className="h-20 object-contain" />
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const fileInput = document.getElementById("logo-upload");
                          if (fileInput) {
                            fileInput.click();
                          }
                        }}
                      >
                        החלף לוגו
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          updateCompanyLogo("");
                          toast({
                            title: "הלוגו הוסר",
                            description: "הלוגו הוסר בהצלחה",
                          });
                        }}
                      >
                        הסר לוגו
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="flex flex-col items-center justify-center h-40 p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const fileInput = document.getElementById("logo-upload");
                      if (fileInput) {
                        fileInput.click();
                      }
                    }}
                  >
                    <Upload className="h-10 w-10 text-pm-blue-500 mb-2" />
                    <p className="text-sm text-gray-500">לחץ להעלאת לוגו</p>
                    <p className="text-xs text-gray-400 mt-1">קבצי PNG, JPG או SVG בלבד</p>
                  </div>
                )}
                
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-pm-blue-600 to-pm-blue-700 hover:from-pm-blue-700 hover:to-pm-blue-800"
              >
                שמור הגדרות
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 mt-6">
            <h2 className="text-lg font-medium mb-4 text-pm-blue-700">גיבוי ושחזור נתונים</h2>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-3">
                ניתן לייצא את כל הנתונים במערכת לקובץ גיבוי, או לייבא נתונים מקובץ גיבוי קיים.
              </p>
              
              <DataBackupModal />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="storage" className="pt-4">
          <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
            <h2 className="text-lg font-medium mb-4 text-pm-blue-700">הגדרות אחסון</h2>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-md font-medium">סוג אחסון</h3>
                <p className="text-sm text-gray-600">
                  בחר היכן לשמור את הנתונים של המערכת.
                </p>
                
                <RadioGroup
                  value={systemSettings.storageType}
                  onValueChange={(value) => 
                    setSystemSettings({ 
                      ...systemSettings, 
                      storageType: value as 'browser' | 'network'
                    })
                  }
                >
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <RadioGroupItem value="browser" id="storage-browser" />
                    <div className="grid gap-1">
                      <Label htmlFor="storage-browser" className="font-medium">אחסון מקומי בדפדפן</Label>
                      <p className="text-sm text-muted-foreground">
                        הנתונים יאוחסנו במחשב המקומי. זמין גם ללא חיבור לאינטרנט או לרשת.
                        <br />מתאים למחשב בודד.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 rtl:space-x-reverse mt-3">
                    <RadioGroupItem value="network" id="storage-network" disabled={!isElectronEnv} />
                    <div className="grid gap-1">
                      <Label htmlFor="storage-network" className="font-medium">תיקיית אחסון</Label>
                      <p className="text-sm text-muted-foreground">
                        {isElectronEnv 
                          ? "אחסון הנתונים בתיקייה נבחרת במחשב או ברשת. מתאים לגיבוי מקומי או שיתוף נתונים."
                          : "אפשרות זו זמינה רק בגרסת שולחן העבודה של האפליקציה."}
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              {systemSettings.storageType === 'network' && (
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-medium">נתיב תיקיית אחסון</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="בחר תיקייה..." 
                      value={systemSettings.networkPath}
                      onChange={(e) => setSystemSettings({ ...systemSettings, networkPath: e.target.value })}
                      className="border-gray-300 focus:border-pm-blue-500 flex-1"
                      readOnly={!isElectronEnv}
                    />
                    <Button 
                      onClick={handleSelectFolder}
                      disabled={!isElectronEnv}
                      className="flex items-center gap-1"
                    >
                      <FolderOpen className="h-4 w-4" />
                      בחר תיקייה
                    </Button>
                  </div>
                  
                  {isElectronEnv ? (
                    <p className="text-xs text-gray-500 mt-1">
                      בחר את התיקייה בה יישמרו נתוני המערכת.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-2">
                      אחסון בתיקייה זמין רק בגרסת שולחן העבודה של האפליקציה.
                      <br />כדי להשתמש באפשרות זו, הורד והתקן את גרסת שולחן העבודה.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleSaveSettings}
                className="bg-gradient-to-r from-pm-blue-600 to-pm-blue-700 hover:from-pm-blue-700 hover:to-pm-blue-800"
              >
                שמור הגדרות אחסון
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workweek" className="pt-4">
          <WorkWeekSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
