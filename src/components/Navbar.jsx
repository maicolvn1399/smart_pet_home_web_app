import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
          {/* Logo / Brand */}
          <Link to="/home" className="flex items-center gap-2">
            <span className="text-xl font-bold text-brand-dark-blue">
              Smart Pet Home
            </span>
          </Link>

          {/* navegación */}
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

          {/* botones de la navegacion derecha */}
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src="" alt="User avatar" />
              <AvatarFallback className="bg-brand-orange text-white">
                U
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar