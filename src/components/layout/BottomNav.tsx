import { Link, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
      </div>
    </nav>
  );
};
