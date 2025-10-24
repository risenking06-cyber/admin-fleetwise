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
    <aside className="w-64 bg-card border-r border-border flex flex-col shadow-lg">
      {/* Full-width Logo Header */}
      <div className="border-b border-border flex flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-transparent">
        <img 
          src="jfarm-logo.png" 
          alt="JFarm Logo" 
          className="w-24 h-24 object-contain mb-2"
        />
        <h1 className="text-base font-semibold text-primary text-center text-[#00522A] leading-tight">
          Sugarcane Management
        </h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md" 
                  : "text-foreground hover:bg-muted"
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                isActive ? 'bg-white/20' : 'group-hover:bg-primary/10'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-border bg-muted/30">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl py-2.5 group"
        >
          <div className="p-1.5 rounded-lg group-hover:bg-destructive/20 transition-colors">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
};
