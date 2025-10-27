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
  totalExpenses: number;
  netIncome: number;
}

// Default colors
const COLORS = ['#ef4444', '#2253bbff']; // Red for Expenses, Blue for Net Income

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
    netIncome, // ✅ passed dynamically
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

  // ✅ Determine dynamic center text
  const isNetIncomeSection = payload.name === 'Net Income';
  const isLoss = netIncome < 0;
  const centerLabel = isNetIncomeSection && isLoss ? 'Net Loss' : payload.name;
  const centerColor = isNetIncomeSection && isLoss ? '#ef4444' : fill;

  return (
    <g>
      {/* ✅ Dynamic center label */}
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill={centerColor}
        className="font-semibold"
      >
        {centerLabel}
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
  totalExpenses,
  netIncome,
}: FinancialPieChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ Ensure values are positive for chart
  const safeExpenses = Math.abs(totalExpenses);
  const safeNetIncome = Math.abs(netIncome);

  const isLoss = netIncome < 0;

  // ✅ Dynamic colors: both red if negative, normal colors otherwise
  const dynamicColors = isLoss ? ['#ef4444', '#ef4444'] : COLORS;

  // ✅ Data for the chart
  const data = [
    { name: 'Expenses', value: safeExpenses },
    { name: 'Net Income', value: safeNetIncome },
  ];

  const handlePieEnter = (_: any, index: number) => setActiveIndex(index);

  const formattedLoss = Math.abs(netIncome).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
  });

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={(props) => renderActiveShape({ ...props, netIncome })} // ✅ pass netIncome
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            startAngle={180}
            endAngle={-180}
            dataKey="value"
            onMouseEnter={handlePieEnter}
            paddingAngle={6}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={dynamicColors[i % dynamicColors.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(val: number, name: string) => [
              `₱${val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ Loss message */}
      {isLoss && (
        <p className="text-center text-red-500 font-medium mt-3 animate-fade-in">
          ⚠ The company is currently operating at a net loss of ₱{formattedLoss}.
        </p>
      )}
    </>
  );
}
