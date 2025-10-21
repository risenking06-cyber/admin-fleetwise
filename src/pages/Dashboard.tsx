import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/card';
import { Users, UsersRound, Car, CreditCard } from 'lucide-react';

// TEST GIT
export default function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    groups: 0,
    travels: 0,
    debts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employees, groups, travels, debts] = await Promise.all([
          getDocs(collection(db, 'employees')),
          getDocs(collection(db, 'groups')),
          getDocs(collection(db, 'travels')),
          getDocs(collection(db, 'debts')),
        ]);

        setStats({
          employees: employees.size,
          groups: groups.size,
          travels: travels.size,
          debts: debts.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats.employees, color: 'text-primary' },
    { icon: UsersRound, label: 'Active Groups', value: stats.groups, color: 'text-accent' },
    { icon: Car, label: 'Total Travels', value: stats.travels, color: 'text-primary' },
    { icon: CreditCard, label: 'Pending Debts', value: stats.debts, color: 'text-destructive' },
  ];

  return (
    <div>
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
