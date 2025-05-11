
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Download, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useOfflineAppContext } from "@/context/OfflineAppContext";

export default function DataBackupModal() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { exportData, importData } = useOfflineAppContext();
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const jsonData = await exportData();
      
      // Create a blob and download it
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "נתונים יוצאו בהצלחה",
        description: "הנתונים יוצאו לקובץ בהצלחה",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "שגיאה בייצוא נתונים",
        description: "אירעה שגיאה בייצוא הנתונים לקובץ",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleImport = () => {
    const fileInput = document.getElementById("data-import");
    if (fileInput) {
      fileInput.click();
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const jsonData = e.target?.result as string;
        if (jsonData) {
          const success = await importData(jsonData);
          if (success) {
            setOpen(false);
          }
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "שגיאה בייבוא נתונים",
        description: "אירעה שגיאה בייבוא הנתונים מהקובץ",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset the input so the same file can be selected again
      event.target.value = '';
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        className="flex gap-2 items-center"
        onClick={() => setOpen(true)}
      >
        <FileText className="h-5 w-5" />
        גיבוי ושחזור נתונים
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>גיבוי ושחזור נתונים</DialogTitle>
            <DialogDescription>
              ניתן לייצא את כל הנתונים לקובץ גיבוי או לייבא נתונים מקובץ גיבוי קיים.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">ייצוא נתונים</h3>
              <p className="text-sm text-gray-600">
                בחירה באפשרות זו תוריד קובץ JSON שמכיל את כל נתוני המערכת.
                שמור את הקובץ במיקום בטוח עבור גיבוי.
              </p>
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full flex justify-center items-center"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    מייצא נתונים...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    ייצוא נתונים לקובץ
                  </>
                )}
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-medium">ייבוא נתונים</h3>
              <p className="text-sm text-gray-600">
                בחירה באפשרות זו תחליף את כל נתוני המערכת הנוכחיים עם הנתונים מקובץ הגיבוי.
                <br />
                <strong className="text-red-500">שים לב:</strong> פעולה זו תמחק את כל הנתונים הקיימים!
              </p>
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full flex justify-center items-center"
                variant="destructive"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    מייבא נתונים...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    ייבוא נתונים מקובץ
                  </>
                )}
              </Button>
              <input
                id="data-import"
                type="file"
                accept="application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              סגור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
