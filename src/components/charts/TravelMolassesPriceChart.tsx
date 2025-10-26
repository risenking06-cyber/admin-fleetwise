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

export default function TravelMolassesPriceChart() {
  const { travels, destinations } = useData();

  const chartData = useMemo(() => {
    const data = travels
      .map((t) => {
        const dest = destinations.find((d) => d.id === t.destination);
        const date = new Date(t.name); // assumes t.name = "October 12, 2025"

        const shortDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        return {
          name: shortDate,
          dateValue: date.getTime(),
          molasses_price: t.molasses_price || 0,
          destination: dest?.name || "Unknown",
        };
      })
      .filter((t) => t.molasses_price > 0 && t.destination.toLowerCase().includes("urc")); // only URC

    // Sort ascending by date
    return data.sort((a, b) => a.dateValue - b.dateValue);
  }, [travels, destinations]);

  if (chartData.length === 0) {
    return <p className="text-center text-muted-foreground py-10">No molasses price data available.</p>;
  }

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
          domain={["auto", "auto"]}
          label={{
            value: "Molasses Price (₱)",
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value: number) => `₱${value.toLocaleString("en-PH")}`}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: "rgba(247, 251, 255, 1)",
            color: "#161718ff",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="molasses_price"
          name="URC Molasses Price"
          stroke="#8B5CF6" // violet
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 6 }}
          connectNulls
        />
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
