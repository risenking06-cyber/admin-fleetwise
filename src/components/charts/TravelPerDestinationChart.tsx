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
import { useData } from "@/contexts/DataContext"; // adjust to your data source

export default function TravelPerDestinationChart() {
    const { travels, destinations } = useData();

    const chartData = useMemo(() => {
        // Convert and map all travels to data points
        const data = travels.map((t) => {
            const dest = destinations.find((d) => d.id === t.destination);
            const date = new Date(t.name); // assumes t.name = "October 12, 2025"

            const shortDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });

            return {
                name: shortDate,
                dateValue: date.getTime(), // numeric for sorting
                sugarcane_price: t.sugarcane_price || 0,
                destination: dest?.name || "Unknown",
                tons: t.tons || 0,
            };
        });

        // 🧠 Sort by date value ascending
        return data.sort((a, b) => a.dateValue - b.dateValue);
    }, [travels, destinations]);


    // 🎨 Darker, consistent color palette
    const colors = [
        "#35a79dff", // teal
        "#6388ecff", // dark blue
        "#db4beeff", // brownish-orange
        "#e95353ff", // indigo
        "#9D174D", // dark magenta
        "#065F46", // forest green
        "#78350F", // golden brown
        "#4C1D95", // deep violet
        "#BE123C", // dark red
        "#064E3B", // dark emerald
    ];

    const destinationsList = Array.from(
        new Set(chartData.map((d) => d.destination))
    );

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
                    domain={[1500, 4500]}
                    ticks={[1500, 2000, 2500, 3000, 3500, 4000, 4500]}
                    label={{
                        value: "Sugarcane Price (₱)",
                        angle: -90,
                        position: "insideLeft",
                    }}
                />
                <Tooltip
                    formatter={(value: number, _, props: any) => [
                        `₱${value.toLocaleString("en-PH")}`,
                        `Tons: ${props.payload.tons}`,
                    ]}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: "rgba(247, 251, 255, 1)", color: "#161718ff" }}
                />
                <Legend />

                {/* ✅ Each destination line still uses same shared chartData */}
                {destinationsList.map((dest, i) => (
                    <Line
                        key={dest}
                        type="monotone"
                        dataKey={(d: any) =>
                            d.destination === dest ? d.sugarcane_price : null
                        }
                        name={dest}
                        stroke={colors[i % colors.length]}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                ))}

                {/* ✅ More visible and properly working brush */}
                <Brush
                    dataKey="name"
                    height={30}
                    stroke="#111827"
                    fill="#E5E7EB"
                    travellerWidth={10}
                    startIndex={Math.max(chartData.length - 20, 0)} // start showing last 20 points
                />
            </LineChart>
        </ResponsiveContainer>

    );
}
