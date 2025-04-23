
import { useAppContext } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Settings() {
  const { state, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
  const { employees } = state;

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

  const handleAddEmployee = () => {
    if (newEmployee.name) {
      addEmployee({
        id: Date.now().toString(),
        name: newEmployee.name,
        position: newEmployee.position,
        department: newEmployee.department,
      });
      setNewEmployee({ name: "", position: "", department: "" });
    }
  };

  const handleEditEmployee = () => {
    if (editingEmployee) {
      updateEmployee(editingEmployee.id, editingEmployee);
      setEditingEmployee(null);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עובד זה?")) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">הגדרות</h1>
      </div>
      
      <Tabs defaultValue="employees" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="employees">ניהול עובדים</TabsTrigger>
          <TabsTrigger value="system">הגדרות מערכת</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="space-y-6 pt-4">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">הוספת עובד חדש</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם העובד*</label>
                <Input
                  placeholder="ישראל ישראלי"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">תפקיד</label>
                <Input
                  placeholder="מהנדס תוכנה"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">מחלקה</label>
                <Input
                  placeholder="פיתוח"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                />
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={handleAddEmployee}>
                הוסף עובד
              </Button>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">רשימת עובדים</h2>
            
            <div className="overflow-x-auto">
              <table className="pm-table w-full">
                <thead>
                  <tr>
                    <th>שם</th>
                    <th>תפקיד</th>
                    <th>מחלקה</th>
                    <th>פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
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
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">הגדרות כלליות</h2>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">שם החברה</label>
                <Input placeholder="החברה שלי בע״מ" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">לוגו החברה</label>
                <div className="flex items-center space-s-2 rtl:space-s-reverse">
                  <Button variant="outline">העלה לוגו</Button>
                  <span className="text-sm text-gray-500">קבצי PNG או SVG בלבד</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">שפת ממשק</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option value="he">עברית</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <Button>שמור הגדרות</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
