import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  Travel,
  Group,
  Employee,
  Land,
  Plate,
  Destination,
  Driver,
} from "@/types";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  calculateTravelExpenses,
  getLandName,
  getPlateName,
  getDestinationName,
  getDriverName,
} from "./utils";

interface LandSummaryTabProps {
  travels: Travel[];
  groups: Group[];
  employees: Employee[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[];
}

export default function LandSummaryTab({
  travels,
  groups,
  employees,
  lands,
  plates,
  destinations,
  drivers,
}: LandSummaryTabProps) {
  const [selectedLand, setSelectedLand] = useState("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [selectedPlate, setSelectedPlate] = useState("all");
  const [selectedDriver, setSelectedDriver] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const reportRef = useRef<HTMLDivElement>(null);

  // ✅ Helper: get driver wage
  const getDriverWageForTravel = (travel: Travel) => {
    const driver = drivers.find((d) => d.employeeId === travel.driver);
    return driver?.wage || 0;
  };

  // Income calculation
  const calculateIncome = (travel: Travel) => {
    const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
    const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
    return sugarIncome + molassesIncome;
  };

  // Filter travels
  const filteredTravels = travels
    .filter((travel) => {
      if (selectedLand !== "all" && travel.land !== selectedLand) return false;
      if (selectedDestination !== "all" && travel.destination !== selectedDestination) return false;
      if (selectedPlate !== "all" && travel.plateNumber !== selectedPlate) return false;
      if (selectedDriver !== "all" && travel.driver !== selectedDriver) return false;
      return true;
    })
    .sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime());

  // Totals (✅ now includes driver wage)
  const totalTons = filteredTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalTravels = filteredTravels.length;
  const totalIncome = filteredTravels.reduce((sum, t) => sum + calculateIncome(t), 0);
  const totalExpenses = filteredTravels.reduce(
    (sum, t) =>
      sum + calculateTravelExpenses(t, groups) + getDriverWageForTravel(t),
    0
  );
  const netIncome = totalIncome - totalExpenses;

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTravels = filteredTravels.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTravels.length / itemsPerPage);

  // 🖼️ Download Image (A4 Portrait)
  const handleDownloadImage = async () => {
    const element = reportRef.current;
    if (!element) return;

    const a4Container = document.createElement("div");
    a4Container.style.width = "794px";
    a4Container.style.minHeight = "1123px";
    a4Container.style.padding = "40px";
    a4Container.style.backgroundColor = "#f9fafb";
    a4Container.style.fontFamily = "'Inter', sans-serif";
    a4Container.style.border = "1px solid #e5e7eb";
    a4Container.style.borderRadius = "12px";

    const title = document.createElement("h2");
    title.innerText = "Land Summary Report";
    title.style.textAlign = "center";
    title.style.color = "#1e3a8a";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";
    title.style.marginBottom = "16px";
    a4Container.appendChild(title);

    const summary = document.createElement("div");
    summary.style.display = "grid";
    summary.style.gridTemplateColumns = "repeat(3, 1fr)";
    summary.style.gap = "12px";
    summary.innerHTML = `
      <div style="background:#eff6ff;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Total Travels</div>
        <div style="color:#1d4ed8;font-size:20px;font-weight:700;">${totalTravels}</div>
      </div>
      <div style="background:#fef9c3;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Total Tons</div>
        <div style="color:#ca8a04;font-size:22px;font-weight:700;">${totalTons.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
      <div style="background:#ecfdf5;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Net Income</div>
        <div style="color:#047857;font-size:22px;font-weight:700;">₱${netIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    `;
    a4Container.appendChild(summary);

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead style="background:#1e3a8a;color:white;font-size:13px;">
        <tr>
          <th style="padding:10px;text-align:left;">Land</th>
          <th style="padding:10px;text-align:left;">Travel</th>
          <th style="padding:10px;text-align:left;">Plate → Destination</th>
          <th style="padding:10px;text-align:left;">Driver</th>
          <th style="padding:10px;text-align:right;">Tons</th>
          <th style="padding:10px;text-align:right;">Income</th>
          <th style="padding:10px;text-align:right;">Expenses</th>
          <th style="padding:10px;text-align:right;">Net</th>
        </tr>
      </thead>
      <tbody style="font-size:12px;color:#111827;">
        ${filteredTravels
          .map((t, i) => {
            const income = calculateIncome(t);
            const expenses = calculateTravelExpenses(t, groups) + getDriverWageForTravel(t);
            const net = income - expenses;
            return `
              <tr style="background:${i % 2 ? "#f9fafb" : "#ffffff"};">
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${getLandName(t.land, lands)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${t.name}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${getPlateName(t.plateNumber, plates)} → ${getDestinationName(t.destination, destinations)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${getDriverName(t.driver, employees)}</td>
                <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e5e7eb;">${t.tons.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="padding:8px 10px;text-align:right;color:#1d4ed8;border-bottom:1px solid #e5e7eb;">₱${income.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="padding:8px 10px;text-align:right;color:#dc2626;border-bottom:1px solid #e5e7eb;">₱${expenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="padding:8px 10px;text-align:right;color:#047857;border-bottom:1px solid #e5e7eb;">₱${net.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>`;
          })
          .join("")}
      </tbody>
    `;
    a4Container.appendChild(table);

    const footer = document.createElement("div");
    footer.innerText = `Generated on: ${new Date().toLocaleString()}`;
    footer.style.textAlign = "right";
    footer.style.fontSize = "11px";
    footer.style.color = "#6b7280";
    footer.style.marginTop = "20px";
    a4Container.appendChild(footer);

    document.body.appendChild(a4Container);
    const canvas = await html2canvas(a4Container, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "land_summary_a4.png";
    link.click();
    document.body.removeChild(a4Container);
  };

  return (
    <div className="space-y-6">
      {/* ✅ Filters and Download (UNCHANGED) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Land Dropdown */}
          <Select value={selectedLand} onValueChange={setSelectedLand}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Land" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lands</SelectItem>
              {lands
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .map((land) => (
                  <SelectItem key={land.id} value={land.id}>
                    {land.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Destination Dropdown */}
          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Plate Dropdown */}
          <Select value={selectedPlate} onValueChange={setSelectedPlate}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plates</SelectItem>
              {plates
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Driver Dropdown */}
          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {drivers
                .map((d) => {
                  const emp = employees.find((e) => e.id === d.employeeId);
                  return emp ? { ...emp, driverId: d.id } : null;
                })
                .filter(Boolean)
                .sort((a, b) => a!.name.localeCompare(b!.name))
                .map((emp: any) => (
                  <SelectItem key={emp.driverId} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleDownloadImage}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <ImageDown className="w-4 h-4" />
          Download Image
        </Button>
      </div>

      {/* ✅ Summary Cards (UNCHANGED) */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50">
          <p className="text-sm text-muted-foreground mb-2">Total Travels</p>
          <p className="text-2xl font-bold text-blue-600">{totalTravels}</p>
        </Card>
        <Card className="p-6 bg-yellow-50">
          <p className="text-sm text-muted-foreground mb-2">Total Tons</p>
          <p className="text-2xl font-bold text-yellow-600">
            {totalTons.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-6 bg-blue-50">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-2xl font-bold text-blue-600">
            ₱ {totalIncome.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-6 bg-red-50">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            ₱ {totalExpenses.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
        <Card className="p-6 bg-green-50">
          <p className="text-sm text-muted-foreground mb-2">Net Income</p>
          <p className="text-2xl font-bold text-green-600">
            ₱ {netIncome.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </Card>
      </div>

      {/* ✅ Table + Pagination (UNCHANGED) */}
      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Land</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Travel</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Plate → Destination
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Driver</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Tons</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Income</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Expenses</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Net</th>
                </tr>
              </thead>
              <tbody>
                {currentTravels.map((t) => {
                  const income = calculateIncome(t);
                  const expenses = calculateTravelExpenses(t, groups) + getDriverWageForTravel(t);
                  const net = income - expenses;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">{getLandName(t.land, lands)}</td>
                      <td className="py-3 px-4">{t.name}</td>
                      <td className="py-3 px-4 text-sm">
                        {getPlateName(t.plateNumber, plates)} →{" "}
                        {getDestinationName(t.destination, destinations)}
                      </td>
                      <td className="py-3 px-4">{getDriverName(t.driver, employees)}</td>
                      <td className="py-3 px-4 text-right">{t.tons.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                        ₱{income.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-semibold">
                        ₱{expenses.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ₱{net.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
