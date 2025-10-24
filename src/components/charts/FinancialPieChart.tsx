import { useState } from 'react';
import {
  PieChart,
  Pie,
  Sector,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';

interface FinancialPieChartProps {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
}

const COLORS = ['#22c55e', '#ef4444', '#3b82f6']; // Green, Red, Blue

function renderActiveShape(props: any) {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold">
        {payload.name}
      </text>

      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />

      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >
        ₱{value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
}

export default function FinancialPieChart({
  totalIncome,
  totalExpenses,
  netIncome,
}: FinancialPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const data = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpenses },
    { name: 'Net Income', value: netIncome },
  ];

  const handlePieEnter = (_: any, index: number) => setActiveIndex(index);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          dataKey="value"
          onMouseEnter={handlePieEnter}
        >
          {data.map((_, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val: number, name: string) =>
            [`₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, name]
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
