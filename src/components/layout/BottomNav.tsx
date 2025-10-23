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
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-card border-t border-border shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              <Icon className="w-6 h-6" />
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center transition-colors duration-200 text-destructive hover:text-destructive/80"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
