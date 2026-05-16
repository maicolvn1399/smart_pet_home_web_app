import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

function Navbar() {
  const location = useLocation()

  const links = [
    { to: '/home', label: 'Home' },
    { to: '/devices', label: 'Devices' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/settings', label: 'Settings' },
  ]

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-dark-blue hidden sm:inline">
              Smart Pet Home
            </span>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side - desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm">
              Logout
            </Button>
            <Avatar>
              <AvatarImage src="" alt="User avatar" />
              <AvatarFallback className="bg-brand-orange text-white">
                U
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile menu - hamburger */}
          <div className="md:hidden flex items-center gap-3">
            <Avatar>
              <AvatarImage src="" alt="User avatar" />
              <AvatarFallback className="bg-brand-orange text-white">
                U
              </AvatarFallback>
            </Avatar>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <span className="text-brand-dark-blue">Smart Pet Home</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6 px-4">
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${
                        location.pathname === link.to
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button variant="outline" className="mt-4">
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar