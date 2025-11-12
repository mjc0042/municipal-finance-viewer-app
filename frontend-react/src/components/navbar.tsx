import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Palette, Home } from "lucide-react";
import { Bell, UserCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  //const { user } = useAuth();

  const navItems = [
    { href: "/finance", label: "Finance View", icon: "📊" },
    { href: "/designer", label: "Designer View", icon: "🎨" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            {/* Logo/Home */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => setLocation('/')}
            >
              <Home className="h-6 w-6 text-teal" />
              <span className="ml-2 text-lg font-semibold text-charcoal">
                MunicipalView
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <button
                  onClick={() => setLocation('/finance')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location === '/finance'
                      ? 'border-b-2 border-teal text-charcoal'
                      : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Finance
                </button>

                <button
                  onClick={() => setLocation('/designer')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location === '/designer'
                      ? 'border-b-2 border-urban-orange text-charcoal'
                      : 'text-gray-500 hover:text-charcoal'
                  }`}
                >
                  <Palette className="h-4 w-4 mr-1" />
                  Designer
                </button>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              // Show Login button when not authenticated
              <Button variant="ghost" onClick={() => setLocation('/login')}>
                Login
              </Button>
            ) : (
              <>
                {/* Trial Status - Desktop */}
                {/*<div className="hidden md:block">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Trial: 23 days left</span>
                    <Link href="/subscribe">
                      <Button
                        size="sm"
                        className="bg-urban-orange text-white hover:bg-urban-orange/90"
                      >
                        Upgrade
                      </Button>
                    </Link>
                  </div>
                </div>*/}

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="text-charcoal hover:text-teal">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* Profile */}
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-charcoal hover:text-teal">
                    <UserCircle className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && isAuthenticated && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                      location === item.href
                        ? "bg-teal text-white"
                        : "text-charcoal hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              ))}

              {/* Mobile Trial Status */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trial: 23 days left</span>
                  <Link href="/subscribe">
                    <Button
                      size="sm"
                      className="bg-urban-orange text-white hover:bg-urban-orange/90"
                    >
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Logout */}
              <div className="px-3 py-2 border-t">
                <Button
                  variant="ghost" onClick={() => { logout(); setLocation('/'); }}
                  className="w-full justify-start text-charcoal hover:bg-gray-100">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );


  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Home */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setLocation('/')}>
              <Home className="h-6 w-6 text-teal" />
              <span className="ml-2 text-lg font-semibold text-charcoal">MunicipalView</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <button
                onClick={() => setLocation('/finance')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location === '/finance'
                    ? 'border-b-2 border-teal text-charcoal'
                    : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                <MapPin className="h-4 w-4 mr-1" />
                Finance
              </button>

              <button
                onClick={() => setLocation('/designer')}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  location === '/designer'
                    ? 'border-b-2 border-urban-orange text-charcoal'
                    : 'text-gray-500 hover:text-charcoal'
                }`}
              >
                <Palette className="h-4 w-4 mr-1" />
                Designer
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <Button variant="ghost" onClick={() => { 
              logout();
              setLocation('/');
            }}>Logout</Button>
          ) : (
            <Button variant="ghost" onClick={() => setLocation('/login')}>Login</Button>
          )}
          </div>
        </div>
      </div>
    </nav>
  );



  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-xl font-bold text-charcoal hover:text-teal cursor-pointer">
                Urban Planner Pro
              </h1>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                        location === item.href
                          ? "bg-teal text-white"
                          : "text-charcoal hover:bg-gray-100"
                      )}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Trial Status - Desktop */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Trial: 23 days left</span>
                <Link href="/subscribe">
                  <Button size="sm" className="bg-urban-orange text-white hover:bg-urban-orange/90">
                    Upgrade
                  </Button>
                </Link>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-charcoal hover:text-teal">
              <Bell className="h-5 w-5" />
            </Button>

            {/* Profile */}
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="text-charcoal hover:text-teal">
                <UserCircle className="h-5 w-5" />
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium cursor-pointer",
                      location === item.href
                        ? "bg-teal text-white"
                        : "text-charcoal hover:bg-gray-100"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </span>
                </Link>
              ))}
              
              {/* Mobile Trial Status */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Trial: 23 days left</span>
                  <Link href="/subscribe">
                    <Button size="sm" className="bg-urban-orange text-white hover:bg-urban-orange/90">
                      Upgrade
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Logout */}
              <div className="px-3 py-2 border-t">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-charcoal hover:bg-gray-100"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
