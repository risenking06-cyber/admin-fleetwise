import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  UserCog,
  CreditCard,
  MapPinned,
  Car,
  MapPin,
  FileText,
  LogOut,
  Settings,
  Banknote,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState, useRef } from 'react';

const menuItems = [
  { icon: LayoutDashboard, path: '/' },
  { icon: Users, path: '/employees' },
  { icon: UsersRound, path: '/groups' },
  { icon: UserCog, path: '/drivers' },
  { icon: CreditCard, path: '/debts' },
  { icon: MapPinned, path: '/lands' },
  { icon: Car, path: '/plates' },
  { icon: MapPin, path: '/destinations' },
  { icon: Banknote, path: '/expenses' },
  { icon: FileText, path: '/summaries' },
  { icon: Settings, path: '/settings' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch {
      toast.error('Failed to logout');
    }
  };

  // Smooth open/close hover delay
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHovered(false), 100);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-lg border-t border-border shadow-xl z-50">
      <div className="flex justify-around items-center py-2 px-1 safe-area-inset-bottom relative">
        {/* First 5 visible items */}
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center transition-all duration-200 p-2 rounded-xl min-w-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:bg-muted'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isActive ? 'bg-primary/10' : ''
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}

        {/* More dropdown - hover container */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Trigger */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl text-muted-foreground hover:text-primary transition-all duration-200 min-w-[56px] cursor-pointer">
            <div className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </div>
          </div>

          {/* Dropdown */}
          <div
            className={cn(
              'absolute bottom-14 right-0 bg-card border border-border rounded-xl shadow-lg p-2 flex flex-col space-y-1 transition-all duration-200',
              hovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            )}
          >
            {menuItems.slice(5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">
                    {item.path.replace('/', '') || 'home'}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center transition-all duration-200 p-2 rounded-xl text-destructive active:bg-destructive/10 min-w-[56px]"
        >
          <div className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
        </button>
      </div>
    </nav>
  );
};
