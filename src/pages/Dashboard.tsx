import { useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Users, UsersRound, Car, CreditCard } from 'lucide-react';
import { StatsLoadingState } from '@/components/LoadingState';

export default function Dashboard() {
  const { employees, groups, travels, debts, loading } = useData();

  const stats = useMemo(() => {
    const pendingDebtsCount = debts.filter(d => !d.paid).length;
    return {
      employees: employees.length,
      groups: groups.length,
      travels: travels.length,
      debts: pendingDebtsCount,
    };
  }, [employees, groups, travels, debts]);


  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats.employees, color: 'text-primary' },
    { icon: UsersRound, label: 'Active Groups', value: stats.groups, color: 'text-accent' },
    { icon: Car, label: 'Total Travels', value: stats.travels, color: 'text-primary' },
    { icon: CreditCard, label: 'Pending Debts', value: stats.debts, color: 'text-destructive' },
  ];

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your logistics management system</p>
        </div>
        <StatsLoadingState />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your logistics management system</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn("p-2 md:p-3 rounded-xl bg-primary/10 flex-shrink-0", stat.color)}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

