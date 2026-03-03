import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import bsuBear from "@/assets/bsu-bear.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="px-6 py-4 flex items-center border-b border-border">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg overflow-hidden">
            <img src={bsuBear} alt="BSU Bear" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-display font-bold text-sm">Career Passport</span>
            <p className="text-[10px] text-muted-foreground leading-none">Career Services & Internship Office</p>
          </div>
        </a>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-6xl">🐻</p>
          <h1 className="text-2xl font-bold mt-4">Oops! Page not found</h1>
          <p className="text-muted-foreground mt-2">This page doesn't exist, but your career journey does.</p>
          <Button asChild className="gap-2 rounded-full px-6 mt-6">
            <a href="/">Back to Home <ArrowRight className="w-4 h-4" /></a>
          </Button>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        Bridgewater State University · Career Services & Internship Office · Career Passport © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default NotFound;
