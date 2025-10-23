import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound, 
  Car, 
  UserCog, 
  CreditCard, 
  MapPin, 
  MapPinned,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Employees', path: '/employees' },
  { icon: UsersRound, label: 'Groups', path: '/groups' },
  { icon: UserCog, label: 'Drivers', path: '/drivers' },
  { icon: CreditCard, label: 'Debts', path: '/debts' },
  { icon: MapPinned, label: 'Lands', path: '/lands' },
  { icon: Car, label: 'Plates', path: '/plates' },
  { icon: MapPin, label: 'Destinations', path: '/destinations' },
  { icon: FileText, label: 'Summaries', path: '/summaries' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
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
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Logistics Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </aside>
  );
};
