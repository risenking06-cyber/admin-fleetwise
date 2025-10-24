import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import { calculateEmployeeWage } from '@/pages/groups/utils';
import type { Driver } from '@/types';

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

  const tooltipStyles = {
    background: 'white',
    borderRadius: '12px',
    padding: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #f0f0f0',
  };

const colorMap: Record<string, string> = {
  income: '#16a34a', // green
  debts: '#dc2626',  // red
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: 12,
        padding: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        border: '1px solid #f3f4f6',
        minWidth: 160,
      }}
    >
      <p style={{ margin: 0, marginBottom: 6, color: '#111827' }}>
        {label}
      </p>

      {payload.map((entry: any, index: number) => {
        const key = entry.dataKey; // 'income' or 'debts'
        const textColor = colorMap[key] || '#374151'; // fallback

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            <span style={{ color: '#6b7280' }}>{entry.name}</span>
            <span style={{ color: textColor }}>
              ₱{entry.value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        );
      })}
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
            name="Total Income "
            fill="url(#incomeGradient)"
            radius={[10, 10, 10, 10]}
            animationDuration={800}
            />

            <Bar
            dataKey="debts"
            name="Total Debts "
            fill="url(#debtGradient)"
            radius={[10, 10, 10, 10]}
            animationDuration={800}
        />

        <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>

            {/* ✅ Correct ID: debtGradient */}
            <linearGradient id="debtGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
        </defs>

      </BarChart>
    </ResponsiveContainer>
  );
}
