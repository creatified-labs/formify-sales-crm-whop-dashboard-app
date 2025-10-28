import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BarChart3, PoundSterling, Target, Calendar, TrendingUp, Menu, X, Phone } from "lucide-react";
import { RevenueEntry, Goal } from "@/types/revenue";
interface LayoutProps {
  children: React.ReactNode;
  revenueEntries: RevenueEntry[];
  goals: Goal[];
}
export const Layout = ({
  children,
  revenueEntries,
  goals
}: LayoutProps) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  const navigation = [{
    name: "Dashboard",
    href: "/",
    icon: BarChart3,
    description: "Overview and quick entry"
  }, {
    name: "Goals",
    href: "/goals",
    icon: Target,
    description: "Set and track goals"
  }, {
    name: "Forms",
    href: "/forms",
    icon: Calendar,
    description: "Form builder and management"
  }, {
    name: "Call Tracker",
    href: "/call-tracker",
    icon: Phone,
    description: "Manage calls and notes"
  }, {
    name: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    description: "Deep insights and trends"
  }];
  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };
  return <div className="min-h-screen bg-background relative">
      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-primary-foreground" />
              </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Formify CRM</h1>
              <p className="text-xs text-muted-foreground">Forms & Sales CRM</p>
            </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map(item => {
                const Icon = item.icon;
                return <Link key={item.name} to={item.href}>
                    <Button variant={isActive(item.href) ? "default" : "ghost"} size="sm" className="button-smooth gap-2">
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>;
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <Button variant="ghost" size="sm" className="md:hidden button-smooth" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <nav className="space-y-2">
                {navigation.map(item => {
                const Icon = item.icon;
                return <Link key={item.name} to={item.href} className="block">
                      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.href) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}>
                        <Icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-75">{item.description}</div>
                        </div>
                      </div>
                    </Link>;
              })}
              </nav>
            </div>}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background/95 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <PoundSterling className="w-4 h-4" />
                <span>{revenueEntries.length} entries</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{goals.length} goals</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Formify CRM © 2024
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>;
};