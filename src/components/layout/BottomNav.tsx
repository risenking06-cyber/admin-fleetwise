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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, path: '/' },
  { icon: Users, path: '/employees' },
  { icon: UsersRound, path: '/groups' },
  { icon: UserCog, path: '/drivers' },
  { icon: CreditCard, path: '/debts' },
  { icon: MapPinned, path: '/lands' },
  { icon: Car, path: '/plates' },
  { icon: MapPin, path: '/destinations' },
  { icon: FileText, path: '/summaries' },
  { icon: Settings, path: '/settings' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-lg border-t border-border shadow-xl z-50">
      <div className="flex justify-around items-center py-2 px-1 safe-area-inset-bottom">
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
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isActive ? 'bg-primary/10' : ''
              )}>
                <Icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
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
