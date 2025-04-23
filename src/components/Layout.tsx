
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "@/context/AppContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useAppContext();

  const navItems = [
    { path: "/", label: "טבלת שיבוץ" },
    { path: "/projects", label: "פרויקטים" },
    { path: "/allocation", label: "אחוזי השקעה" },
    { path: "/monthly", label: "סקירה חודשית" },
    { path: "/settings", label: "הגדרות" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pm-blue-800 to-pm-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">מערכת ניהול הזמנות עבודה</h1>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4 space-x-reverse">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? "bg-pm-blue-900 text-white"
                        : "text-white hover:bg-pm-blue-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden bg-pm-blue-800 pb-2">
            <ul className="space-y-1 px-2 pt-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? "bg-pm-blue-700 text-white"
                        : "text-gray-100 hover:bg-pm-blue-600"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Logo area */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
        <div className="container mx-auto py-4 px-4 flex justify-center">
          {state.companyLogo ? (
            <img 
              src={state.companyLogo} 
              alt="לוגו החברה" 
              className="h-16 object-contain" 
            />
          ) : (
            <div className="h-16 w-40 flex items-center justify-center bg-white rounded-md border border-dashed border-gray-400">
              <span className="text-gray-500 text-sm">לוגו החברה</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content with futuristic design */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
