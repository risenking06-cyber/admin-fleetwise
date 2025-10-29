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
      const date = new Date(t.name);
      const ton = t.tons;

      const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
      const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
      const totalIncome = sugarIncome + molassesIncome;

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

  // Unique destination names
  const destinationsList = Array.from(new Set(chartData.map((d) => d.destination)));

  // 🔹 Custom Tooltip
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
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" style={{ color: lineColor }} />
            <span style={{ color: lineColor }}>{label}</span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" style={{ color: lineColor }} />
            <span className="font-semibold" style={{ color: lineColor }}>
              {data.destination}
            </span>
          </div>

          <div className="space-y-1.5 mt-2 text-sm">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" style={{ color: lineColor }} />
              <span style={{ color: lineColor }}>
                <span className="font-medium">₱</span>
                {data.netIncome.toLocaleString("en-PH")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" style={{ color: lineColor }} />
              <span style={{ color: lineColor }}>
                {data.ton?.toLocaleString("en-PH") || 0} tons
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={450}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} interval={0} />
        <YAxis
          label={{ value: " ", angle: -90, position: "insideLeft" }}
          tickFormatter={(value) => `₱${value.toLocaleString("en-PH")}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {destinationsList.map((destName) => {
          const dest = destinations.find((d) => d.name === destName);
          const color = dest?.color || "#2563EB";

          return (
            <Line
              key={destName}
              type="monotone"
              dataKey={(d: any) => (d.destination === destName ? d.netIncome : null)}
              name={destName}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          );
        })}
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
