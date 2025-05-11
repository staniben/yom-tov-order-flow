import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfflineAppContext } from "@/context/OfflineAppContext";
import { Link } from "react-router-dom";

const Index = () => {
  const { state } = useOfflineAppContext();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">ברוכים הבאים למערכת ניהול הזמנות עבודה</h1>
        <p className="text-xl text-gray-600 mb-8">מערכת פשוטה לניהול הזמנות עבודה ושיבוץ עובדים לפרויקטים</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>עובדים</CardTitle>
            <CardDescription>ניהול רשימת העובדים במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <p>מספר עובדים: {state.employees.length}</p>
          </CardContent>
          <CardFooter>
            <Link to="/" className="w-full">
              <Button className="w-full">צפייה בטבלת שיבוץ</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>פרויקטים</CardTitle>
            <CardDescription>ניהול הפרויקטים במערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <p>מספר פרויקטים: {state.projects.length}</p>
          </CardContent>
          <CardFooter>
            <Link to="/projects" className="w-full">
              <Button className="w-full">צפייה בפרויקטים</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הגדרות</CardTitle>
            <CardDescription>הגדרות המערכת</CardDescription>
          </CardHeader>
          <CardContent>
            <p>שם החברה: {state.companyName || "לא הוגדר"}</p>
          </CardContent>
          <CardFooter>
            <Link to="/settings" className="w-full">
              <Button className="w-full">הגדרות מערכת</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Index;
