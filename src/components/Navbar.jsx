import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu, ChevronDown, Contrast } from 'lucide-react'
import { usePet } from '@/context/PetContext'
import { useLogout } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { useTheme } from '@/hooks/useTheme'

import logo from '@/assets/logo/logo_navbar.png'

function PetAvatar({ pet, size }) {
  const initials = pet.name.slice(0, 1).toUpperCase()
  return (
    <Avatar size={size}>
      <AvatarImage src={pet.profile_pic_url ?? ''} alt={pet.name} />
      <AvatarFallback className="bg-brand-medium-blue text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}

function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors border ${
        theme === 'dark'
          ? 'bg-brand-dark-blue border-brand-dark-blue'
          : 'bg-muted border-border'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-5 h-5 transform rounded-full bg-white transition-transform shadow-sm ${
          theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      >
        <Contrast className={`w-3 h-3 ${theme === 'dark' ? 'text-brand-dark-blue' : 'text-muted-foreground'}`} />
      </span>
    </button>
  )
}

function Navbar() {
  const location = useLocation()
  const { pets, activePet, setActivePet } = usePet()
  const { handleLogout } = useLogout()
  const { user } = useUser()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { to: '/home',      label: 'Home'      },
    { to: '/devices',   label: 'Devices'   },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/settings',  label: 'Settings'  },
  ]

  const userInitial = user?.full_name?.slice(0, 1).toUpperCase() ?? 'U'

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2">
            <img src={logo} alt="Smart Pet Home" className="h-20 w-auto" />
            <span className="text-xl font-bold text-brand-dark-blue hidden sm:inline">
              Smart Pet Home
            </span>
          </Link>

          {/* Desktop nav links */}
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

          {/* Right side — desktop */}
          <div className="hidden md:flex items-center gap-3">

            {/* Pet selector */}
            {activePet && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 pr-2">
                    <PetAvatar pet={activePet} size="default" />
                    <span className="text-sm font-medium">{activePet.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Switch pet
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {pets.map((pet) => (
                    <DropdownMenuItem
                      key={pet.id}
                      onClick={() => setActivePet(pet)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        activePet.id === pet.id ? 'bg-muted' : ''
                      }`}
                    >
                      <PetAvatar pet={pet} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">{pet.breed}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>

            {/* User avatar */}
            <Avatar size="default">
              <AvatarImage src={user?.avatar_url ?? ''} alt="User avatar" />
              <AvatarFallback className="bg-brand-orange text-white">
                {userInitial}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-3">

            {/* Pet selector mobile */}
            {activePet && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex items-center gap-1">
                    <PetAvatar pet={activePet} size="default" />
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Switch pet
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {pets.map((pet) => (
                    <DropdownMenuItem
                      key={pet.id}
                      onClick={() => setActivePet(pet)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        activePet.id === pet.id ? 'bg-muted' : ''
                      }`}
                    >
                      <PetAvatar pet={pet} size="sm" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{pet.name}</span>
                        <span className="text-xs text-muted-foreground">{pet.breed}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User avatar mobile */}
            <Avatar size="default">
              <AvatarImage src={user?.avatar_url ?? ''} alt="User avatar" />
              <AvatarFallback className="bg-brand-orange text-white">
                {userInitial}
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
                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className="text-sm text-muted-foreground">Dark mode</span>
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                  </div>
                  <Button variant="outline" className="mt-4" onClick={handleLogout}>
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