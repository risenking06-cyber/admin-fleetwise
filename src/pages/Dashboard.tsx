import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useData } from '@/contexts/DataContext';
import { Card } from '@/components/ui/card';
import { Users, UsersRound, Car, CreditCard } from 'lucide-react';
import { StatsLoadingState } from '@/components/LoadingState';
import FinancialPieChart from '@/components/charts/FinancialPieChart';
import EmployeeIncomeDebtChart from '@/components/charts/EmployeeIncomeDebtChart';
import { calculateEmployeeWage } from './groups/utils';
import type { Driver } from '@/types';

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const { employees, groups, travels, debts, loading } = useData();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

  // 🔹 Fetch drivers from Firestore once
  useEffect(() => {
    const fetchDrivers = async () => {
      const snapshot = await getDocs(collection(db, 'drivers'));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver));
      setDrivers(data);
      setDriversLoading(false);
    };
    fetchDrivers();
  }, []);

  const stats = useMemo(() => {
    if (loading || driversLoading) return null;

    // 🔹 Filter unpaid debts only
    const unpaidDebts = debts.filter((d) => !d.paid);
    const totalDebtAmount = unpaidDebts.reduce((sum, d) => sum + (d.amount || 0), 0);

    // 🔹 Compute income
    const totalIncome = travels.reduce((sum, t) => {
      const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
      const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
      return sum + sugarIncome + molassesIncome;
    }, 0);

    // 🔹 Compute expenses (including drivers)
    const totalExpenses = travels.reduce((sum, t) => {
      // Wages for group-based employees
      const groupWages = (t.attendance || []).reduce(
        (acc, att) => acc + calculateEmployeeWage(t, att.employeeId, groups),
        0
      );

      // Other expenses
      const otherExpenses = (t.expenses || []).reduce(
        (acc, e) => acc + (e.amount || 0),
        0
      );

      // 🔸 Add driver’s wage if the driver exists
      const driver = drivers.find((d) => d.employeeId === t.driver);
      const driverWage = driver ? driver.wage || 0 : 0;

      return sum + groupWages + otherExpenses + driverWage;
    }, 0);

    const netIncome = totalIncome - totalExpenses;

    return {
      employees: employees.length,
      groups: groups.length,
      travels: travels.length,
      debts: unpaidDebts.length,
      totalDebts: totalDebtAmount,
      totalIncome,
      totalExpenses,
      netIncome,
    };
  }, [employees, groups, travels, debts, drivers, loading, driversLoading]);

  if (loading || driversLoading || !stats) {
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
  console.log("test 2");
  const statCards = [
    { icon: Users, label: 'Total Employees', value: stats.employees, color: 'text-primary' },
    { icon: UsersRound, label: 'Active Groups', value: stats.groups, color: 'text-accent' },
    { icon: Car, label: 'Total Travels', value: stats.travels, color: 'text-primary' },
    { icon: CreditCard, label: 'Pending Debts', value: stats.debts, color: 'text-destructive' },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to your logistics management system</p>
      </div>

      {/* 🟩 Row 1 – Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1 truncate">
                    {stat.label}
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={cn('p-2 md:p-3 rounded-xl bg-primary/10 flex-shrink-0', stat.color)}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 🟦 Row 2 – Financial Summary + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Summary */}
        <div className="space-y-4">
          <Card className="p-6 bg-green-50">
            <p className="text-sm text-muted-foreground mb-1">Total Income</p>
            <p className="text-3xl font-bold text-green-600">
              ₱{stats.totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-red-50">
            <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              ₱{stats.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-muted-foreground mb-1">Net Income</p>
            <p className="text-3xl font-bold text-blue-600">
              ₱{stats.netIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-neutral-50">
            <p className="text-sm text-muted-foreground mb-1">Total Debts</p>
            <p className="text-3xl font-bold text-neutral-800">
              ₱{stats.totalDebts.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </Card>
        </div>

        {/* Pie Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Breakdown</h2>
          <FinancialPieChart
            totalIncome={stats.totalIncome}
            totalExpenses={stats.totalExpenses}
            netIncome={stats.netIncome}
          />
        </Card>
      </div>

      {/* 🟨 Row 3 – Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Income vs Total Debts</h2>
          {/* Pass drivers as prop so chart computes properly */}
          <EmployeeIncomeDebtChart drivers={drivers} />
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Soon</h2>
          
        </Card>
      </div>
    </div>
  );
}

