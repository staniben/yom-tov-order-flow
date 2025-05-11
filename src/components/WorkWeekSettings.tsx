
import { useState } from "react";
import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const daysOfWeek = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function WorkWeekSettings() {
  const { state, updateWorkWeekSettings } = useOfflineAppContext();
  const { workWeekSettings } = state;
  
  const [localSettings, setLocalSettings] = useState({
    workDays: [...workWeekSettings.workDays],
    hoursPerDay: workWeekSettings.hoursPerDay,
  });

  const handleToggleDay = (dayIndex: number) => {
    const newWorkDays = [...localSettings.workDays];
    newWorkDays[dayIndex] = !newWorkDays[dayIndex];
    setLocalSettings({ ...localSettings, workDays: newWorkDays });
  };

  const handleHoursChange = (hours: string) => {
    const hoursNumber = parseFloat(hours);
    if (!isNaN(hoursNumber) && hoursNumber >= 0) {
      setLocalSettings({ ...localSettings, hoursPerDay: hoursNumber });
    }
  };

  const handleSaveSettings = () => {
    // Make sure at least one day is selected
    if (!localSettings.workDays.some(day => day)) {
      toast({
        title: "שגיאה",
        description: "יש לבחור לפחות יום עבודה אחד",
        variant: "destructive",
      });
      return;
    }

    updateWorkWeekSettings(localSettings);
    toast({
      title: "הגדרות נשמרו",
      description: "הגדרות שבוע העבודה עודכנו בהצלחה",
    });
  };

  return (
    <Card className="bg-white p-5 rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <CardHeader className="pb-4 pt-2 px-0 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-medium flex items-center text-pm-blue-700">
          <Clock className="h-5 w-5 mr-2 text-pm-blue-700" />
          הגדרות שבוע עבודה
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 space-y-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">ימי עבודה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {daysOfWeek.map((day, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <Label htmlFor={`day-${index}`} className="cursor-pointer">
                  {day}
                </Label>
                <Switch
                  id={`day-${index}`}
                  checked={localSettings.workDays[index]}
                  onCheckedChange={() => handleToggleDay(index)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label htmlFor="hours-per-day" className="text-sm font-medium text-gray-700">
            שעות עבודה ליום
          </Label>
          <div className="flex items-center">
            <Input
              id="hours-per-day"
              type="number"
              min="0"
              step="0.5"
              value={localSettings.hoursPerDay}
              onChange={(e) => handleHoursChange(e.target.value)}
              className="w-32 ltr"
            />
            <span className="mr-2">שעות</span>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-pm-blue-600 to-pm-blue-700 hover:from-pm-blue-700 hover:to-pm-blue-800"
          >
            שמור הגדרות
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
