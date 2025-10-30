import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { calculateEmployeeWage } from '@/pages/groups/utils';
import type { Driver } from '@/types';
import { Wallet, CreditCard } from 'lucide-react'; // ✅ Icons only

interface Props {
  drivers: Driver[];
}

export default function EmployeeIncomeDebtChart({ drivers }: Props) {
  const { employees, groups, travels, debts } = useData();

  const data = useMemo(() => {
    return employees.map((emp) => {
      const driver = drivers.find((d) => d.employeeId === emp.id);
      const driverTravelCount = travels.filter((t) => t.driver === emp.id).length;
      let totalIncome = 0;

      if (driver) {
        totalIncome = (driver.wage || 0) * driverTravelCount;
      } else {
        totalIncome = travels.reduce((sum, travel) => {
          const wage = (travel.attendance || []).reduce((acc, att) => {
            if (att.employeeId === emp.id) {
              return acc + calculateEmployeeWage(travel, emp.id, groups);
            }
            return acc;
          }, 0);
          return sum + wage;
        }, 0);
      }

      const totalDebts = debts
        .filter((d) => d.employeeId === emp.id && !d.paid)
        .reduce((sum, d) => sum + (d.amount || 0), 0);

      return {
        name: emp.name || 'Unnamed',
        income: totalIncome,
        debts: totalDebts,
      };
    });
  }, [employees, travels, debts, groups, drivers]);

  // ✅ Tailwind-based tooltip (icons only)
  const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 min-w-[120px]">
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>

      <div className="space-y-1">
        {payload.map((entry: any, index: number) => {
          const key = entry.dataKey;
          const value = entry.value;
          const Icon = key === 'income' ? Wallet : CreditCard;
          const color =
            key === 'income' ? 'text-green-600' : 'text-red-600';

          return (
            <div
              key={index}
              className="flex items-center justify-between text-sm font-medium"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              <span className={`${color} text-right w-[130px] truncate`}>
                ₱{value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


  return (
    <ResponsiveContainer width="100%" height={460}>
      <BarChart
        data={data}
        layout="vertical"
        barCategoryGap="25%"
        style={{ fontFamily: 'Inter, sans-serif' }}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

        <XAxis
          type="number"
          tickFormatter={(v) => `₱${v.toLocaleString('en-PH')}`}
          tick={{ fontSize: 12, fill: '#4b5563' }}
        />

        <YAxis
          dataKey="name"
          type="category"
          width={80}
          tick={{ fontSize: 13, fontWeight: 500, fill: '#111827' }}
        />

        <Tooltip content={<CustomTooltip />} />

        <Bar
          dataKey="income"
          name="Income"
          fill="url(#incomeGradient)"
          radius={[10, 10, 10, 10]}
          animationDuration={800}
        />

        <Bar
          dataKey="debts"
          name="Debts"
          fill="url(#debtGradient)"
          radius={[10, 10, 10, 10]}
          animationDuration={800}
        />

        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>

          <linearGradient id="debtGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
