import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { calculateEmployeeWage } from "@/pages/groups/utils";
import { MapPin, Wallet, Truck, Calendar } from "lucide-react";

export default function TravelNetIncomePerDestinationChart() {
  const { travels, destinations, groups, drivers } = useData();

  const chartData = useMemo(() => {
    const data = travels.map((t) => {
      const dest = destinations.find((d) => d.id === t.destination);
      const date = new Date(t.name); // assumes travel name = "October 12, 2025"
      const ton = t.tons;
      // Compute Income
      const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
      const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
      const totalIncome = sugarIncome + molassesIncome;

      // Compute Expenses (employee wages + driver wage + other expenses)
      const groupWages = (t.attendance || []).reduce(
        (acc, att) => acc + calculateEmployeeWage(t, att.employeeId, groups),
        0
      );
      const driver = drivers.find((d) => d.employeeId === t.driver);
      const driverWage = driver ? driver.wage || 0 : 0;
      const otherExpenses = (t.expenses || []).reduce(
        (acc, e) => acc + (e.amount || 0),
        0
      );

      const totalExpenses = groupWages + otherExpenses + driverWage;
      // const totalExpenses = groupWages + otherExpenses;
      const netIncome = totalIncome - totalExpenses;

      const shortDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        name: shortDate,
        dateValue: date.getTime(),
        destination: dest?.name || "Unknown",
        netIncome,
        ton,
      };
    });

    return data.sort((a, b) => a.dateValue - b.dateValue);
  }, [travels, destinations, groups, drivers]);

  const colors = [
    "#04a82dff", // green
    "#2563EB", // blue
    "#cc8409ff", // amber
    "#EF4444", // red
    "#8B5CF6", // violet
    "#0EA5E9", // sky
    "#D946EF", // pink
    "#059669", // teal
    "#F97316", // orange
    "#7C3AED", // purple
  ];

  const destinationsList = Array.from(new Set(chartData.map((d) => d.destination)));

  // 🔹 Custom Tooltip with line color for destination
 const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const lineColor = payload[0].color;

    return (
      <div
        className="rounded-xl shadow-lg border border-white/30 p-4 min-w-[200px] 
                   bg-gradient-to-br from-white/80 to-slate-50/90 
                   backdrop-blur-md text-slate-800 dark:from-slate-900/80 
                   dark:to-slate-800/80 dark:text-slate-100 transition-all"
      >
        {/* Date */}
        <div className="flex items-center gap-2 mb-2">
          <Calendar 
            className="w-4 h-4"
            style={{
              color: lineColor,
              filter: `drop-shadow(0 0 4px ${lineColor}80)`,
            }}
          />
          <span>{label}</span>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-2 mb-2">
          <MapPin
            className="w-4 h-4"
            style={{
              color: lineColor,
              filter: `drop-shadow(0 0 4px ${lineColor}80)`,
            }}
          />
          <span
            className="font-semibold"
            style={{ color: lineColor }}
          >
            {data.destination}
          </span>
        </div>

        {/* Income and Tons */}
        <div className="space-y-1.5 mt-2 text-sm">
          <div className="flex items-center gap-2">
            <Wallet
              className="w-4 h-4"
              style={{
                color: lineColor,
                filter: `drop-shadow(0 0 4px ${lineColor}60)`,
              }}
            />
            <span>
              <span className="font-medium">₱</span>
              {data.netIncome.toLocaleString("en-PH")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Truck
              className="w-4 h-4"
              style={{
                color: lineColor,
                filter: `drop-shadow(0 0 4px ${lineColor}60)`,
              }}
            />
            <span>
              {data.ton?.toLocaleString("en-PH") || 0} tons
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


  // End of Custom Tooltip

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          angle={-30}
          textAnchor="end"
          height={50}
          interval={0}
        />
        <YAxis
          label={{
            value: " ",
            angle: -90,
            position: "insideLeft",
          }}
          tickFormatter={(value) => `₱${value.toLocaleString("en-PH")}`}
        />
        {/* <Tooltip
          formatter={(value: number) => `₱${value.toLocaleString("en-PH")}`}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: "rgba(247, 251, 255, 1)",
            color: "#161718ff",
          }}
        /> */}
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {destinationsList.map((dest, i) => (
          <Line
            key={dest}
            type="monotone"
            dataKey={(d: any) =>
              d.destination === dest ? d.netIncome : null
            }
            name={dest}
            stroke={colors[i % colors.length]}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
        <Brush
          dataKey="name"
          height={30}
          stroke="#111827"
          fill="#E5E7EB"
          travellerWidth={10}
          startIndex={Math.max(chartData.length - 20, 0)}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
