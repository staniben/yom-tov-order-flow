
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useOfflineAppContext } from "@/context/OfflineAppContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useOfflineAppContext();

  const navItems = [
    { path: "/", label: "טבלת שיבוץ" },
    { path: "/dashboard", label: "לוח מחוונים" },
    { path: "/projects", label: "פרויקטים" },
    { path: "/allocation", label: "אחוזי השקעה" },
    { path: "/monthly", label: "סקירה חודשית" },
    { path: "/settings", label: "הגדרות" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with enhanced futuristic design */}
      <header className="bg-gradient-to-r from-pm-blue-900 to-pm-blue-700 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(at_top_left,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.1)_50%)]"></div>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center relative z-10">
          <h1 className="text-xl font-bold tracking-tight">
            מערכת ניהול הזמנות עבודה
            <span className="inline-block ml-2 bg-gradient-to-r from-blue-300 to-indigo-300 px-2 py-1 text-xs rounded-full text-blue-900">v2.0</span>
          </h1>
          
          {/* Mobile menu button with futuristic design */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none bg-pm-blue-800 hover:bg-pm-blue-700 p-2 rounded-lg transition-all duration-200"
            aria-label="תפריט ניווט"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {/* Desktop navigation with enhanced design */}
          <nav className="hidden md:block">
            <ul className="flex space-x-4 space-x-reverse">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-transparent ${
                      location.pathname === item.path
                        ? "bg-white text-pm-blue-900 shadow-lg"
                        : "text-white hover:bg-pm-blue-800 hover:border-pm-blue-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Mobile navigation with futuristic design */}
        {isMenuOpen && (
          <nav className="md:hidden bg-pm-blue-800 border-t border-pm-blue-600 pb-2 shadow-inner">
            <ul className="space-y-1 px-4 pt-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? "bg-white text-pm-blue-900"
                        : "text-gray-100 hover:bg-pm-blue-700"
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

      {/* Logo area with enhanced design */}
      <div className="bg-gradient-to-r from-white to-gray-100 border-b border-gray-300 shadow-sm">
        <div className="container mx-auto py-4 px-4 flex justify-center">
          {state.companyLogo ? (
            <img 
              src={state.companyLogo} 
              alt="לוגו החברה" 
              className="h-16 object-contain" 
            />
          ) : (
            <div className="h-16 w-40 flex items-center justify-center bg-white rounded-md border border-dashed border-gray-400 shadow-inner">
              <span className="text-gray-500 text-sm">לוגו החברה</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content with enhanced futuristic design */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 bg-opacity-90 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(at_top_right,_rgba(59,130,246,0.05)_0%,_transparent_50%)]"></div>
          <div className="absolute inset-x-0 -bottom-4 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
