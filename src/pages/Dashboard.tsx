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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn("p-3 rounded-lg bg-secondary", stat.color)}>
                  <Icon className="w-6 h-6" />
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

