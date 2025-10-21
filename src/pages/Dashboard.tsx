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

// in my group page. i want to have a button after edit group that is add travel.
// when i add travel to that group, it will automatically link to that group. for this, i think you need to change my travels interface because there will be only 1group per travel
// also, in my group page, when i click the group, a modal will appear that shows my travels in that group, also there will be a button in each travels for crud functions of travels.
// also,i want a summary button before the delete button in my groups page. when i click that, modal will show up like in my summaries feature where you can see the computation of their wages. i want the exact design of that like the summaries page.
// like the summaries page, i want employee summary and income summary. the income summary is like this picture i uploaded
// since the travel page features was moved to groups page, remove the travel page. Let the summaries page stay, i have other plan for that page.
// also, in my employee summary, the debts of the employee should show up there. i currently saw it shows zero, you need to fix that