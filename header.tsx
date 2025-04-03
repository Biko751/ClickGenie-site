import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is logged in based on localStorage
  useEffect(() => {
    const checkLoggedIn = () => {
      const sessionId = localStorage.getItem('sessionId');
      const userData = localStorage.getItem('userData');
      setIsLoggedIn(!!sessionId && !!userData);
    };
    
    // Check immediately
    checkLoggedIn();
    
    // Setup event listener for storage changes
    window.addEventListener('storage', checkLoggedIn);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', checkLoggedIn);
    };
  }, []);

  const handleLogout = () => {
    // Simple logout functionality
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    window.location.href = '/'; // Navigate to home page
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg p-1 text-white">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-6 h-6"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-bold text-xl text-gray-900">ClickGenie</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/" 
            className={`font-medium hover:text-primary transition ${isActive('/') ? 'text-primary' : 'text-gray-500'}`}
          >
            Home
          </Link>
          <Link 
            href="/how-it-works" 
            className={`font-medium hover:text-primary transition ${isActive('/how-it-works') ? 'text-primary' : 'text-gray-500'}`}
          >
            How It Works
          </Link>
          <Link 
            href="/testimonials" 
            className={`font-medium hover:text-primary transition ${isActive('/testimonials') ? 'text-primary' : 'text-gray-500'}`}
          >
            Testimonials
          </Link>
          <Link 
            href="/dashboard" 
            className={`font-medium hover:text-primary transition ${isActive('/dashboard') ? 'text-primary' : 'text-gray-500'}`}
          >
            Dashboard
          </Link>
        </nav>
        
        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="hidden md:block"
            >
              Log Out
            </Button>
          ) : (
            <>
              <Link href="/login" className="hidden md:block">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700">Sign Up</Button>
              </Link>
            </>
          )}
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col space-y-4 mt-6">
                <Link href="/" onClick={closeMobileMenu}>
                  <div className={`p-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary' : ''}`}>
                    Home
                  </div>
                </Link>
                <Link href="/how-it-works" onClick={closeMobileMenu}>
                  <div className={`p-2 rounded-md ${isActive('/how-it-works') ? 'bg-primary/10 text-primary' : ''}`}>
                    How It Works
                  </div>
                </Link>
                <Link href="/testimonials" onClick={closeMobileMenu}>
                  <div className={`p-2 rounded-md ${isActive('/testimonials') ? 'bg-primary/10 text-primary' : ''}`}>
                    Testimonials
                  </div>
                </Link>
                <Link href="/dashboard" onClick={closeMobileMenu}>
                  <div className={`p-2 rounded-md ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : ''}`}>
                    Dashboard
                  </div>
                </Link>
                
                <Separator />
                
                {isLoggedIn ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                  >
                    Log Out
                  </Button>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMobileMenu} className="w-full">
                      <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/signup" onClick={closeMobileMenu} className="w-full">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
