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
import { Menu, ChevronDown, Contrast, Bell } from 'lucide-react'
import { usePet } from '@/context/PetContext'
import { useLogout } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'
import { usePushNotifications } from '@/hooks/usePushNotifications'

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

function NotificationItem({ notification }) {
  const levelColor = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className={`flex flex-col gap-1 px-3 py-2.5 rounded-lg border ${
      notification.read ? 'opacity-60' : ''
    } ${levelColor[notification.level] ?? levelColor.info}`}>
      <p className="text-xs font-medium">{notification.message}</p>
      <p className="text-xs opacity-70">
        {new Date(notification.created_at).toLocaleString([], {
          month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}
      </p>
    </div>
  )
}

function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAllAsRead,
  } = useNotifications()

  const {
    subscribed,
    loading: loadingPush,
    subscribe,
    unsubscribe,
  } = usePushNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-1.5 rounded-md hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-brand-orange hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="flex flex-col gap-2 p-3 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Loading...</p>
          ) : notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No notifications yet.
            </p>
          ) : (
            notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))
          )}
        </div>

        {/* Push notifications toggle */}
        <div className="border-t px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-foreground">
              Push notifications
            </p>
            <p className="text-xs text-muted-foreground">
              {subscribed ? 'Enabled on this device' : 'Enable for this device'}
            </p>
          </div>
          <button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={loadingPush}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors border flex-shrink-0 ${
              subscribed
                ? 'bg-brand-dark-blue border-brand-dark-blue'
                : 'bg-muted border-border'
            }`}
          >
            <span
              className={`inline-block w-4 h-4 transform rounded-full bg-white transition-transform shadow-sm ${
                subscribed ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
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

            {/* Notifications */}
            <NotificationDropdown />

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

            {/* Notifications mobile */}
            <NotificationDropdown />

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