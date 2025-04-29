
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { migrateLocalDataToSupabase } from "@/migrations/initialDataSync";
import { useAppContext } from "@/context/AppContext";

export default function DataMigrationModal() {
  const [open, setOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { state, refreshData } = useAppContext();
  
  // Check if we need to show the migration dialog
  useEffect(() => {
    const hasMigrated = localStorage.getItem('data-migrated');
    if (!hasMigrated) {
      setOpen(true);
    }
  }, []);
  
  const handleMigrate = async () => {
    try {
      setIsMigrating(true);
      const result = await migrateLocalDataToSupabase(state);
      
      if (result.success) {
        localStorage.setItem('data-migrated', 'true');
        toast({
          title: "הנתונים הועברו בהצלחה",
          description: "כל הנתונים הועברו בהצלחה למסד הנתונים",
        });
        
        // Refresh data from Supabase
        await refreshData();
        
        setOpen(false);
      } else {
        toast({
          title: "שגיאה בהעברת נתונים",
          description: "אירעה שגיאה בהעברת הנתונים, נא לנסות שוב מאוחר יותר",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "שגיאה בהעברת נתונים",
        description: "אירעה שגיאה בהעברת הנתונים, נא לנסות שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };
  
  const handleSkip = () => {
    localStorage.setItem('data-migrated', 'true');
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>העברת נתונים</DialogTitle>
          <DialogDescription>
            אותרו נתונים מקומיים במערכת. האם להעביר את כל הנתונים לשרת?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600">
            לאחר העברת הנתונים, תוכל לגשת אליהם מכל מכשיר וגם אם תנקה את נתוני הדפדפן.
            <br />
            נתונים שלא יועברו יישארו מקומיים ויהיו זמינים רק במכשיר זה.
          </p>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isMigrating}>
            דלג
          </Button>
          <Button onClick={handleMigrate} disabled={isMigrating}>
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                מעביר נתונים...
              </>
            ) : "העבר נתונים"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
