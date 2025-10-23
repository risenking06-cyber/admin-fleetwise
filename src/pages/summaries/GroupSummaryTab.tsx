import { useRef, useState } from "react";
import { Group, Travel, Employee, Plate, Destination } from "@/types";
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
import html2canvas from "html2canvas";
import {
  getGroupTravels,
  calculateTravelExpenses,
  getPlateName,
  getDestinationName,
  getDriverName,
} from "./utils";

interface GroupSummaryTabProps {
  groups: Group[];
  travels: Travel[];
  employees: Employee[];
  plates: Plate[];
  destinations: Destination[];
  selectedGroupId: string;
  onGroupChange: (value: string) => void;
}

export default function GroupSummaryTab({
  groups,
  travels,
  employees,
  plates,
  destinations,
  selectedGroupId,
  onGroupChange,
}: GroupSummaryTabProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTravels =
    selectedGroupId === "all"
      ? travels
      : getGroupTravels(selectedGroupId, travels);

  const calculateIncome = (travel: Travel) => {
    const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
    const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
    return sugarIncome + molassesIncome;
  };

  const totalTravels = filteredTravels.length;
  const totalTons = filteredTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalIncome = filteredTravels.reduce((sum, t) => sum + calculateIncome(t), 0);
  const totalExpenses = filteredTravels.reduce(
    (sum, t) => sum + calculateTravelExpenses(t, groups),
    0
  );
  const netIncome = totalIncome - totalExpenses;

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
    a4Container.style.height = "1123px";
    a4Container.style.padding = "40px";
    a4Container.style.backgroundColor = "#f9fafb";
    a4Container.style.fontFamily = "'Inter', sans-serif";
    a4Container.style.display = "flex";
    a4Container.style.flexDirection = "column";
    a4Container.style.border = "1px solid #e5e7eb";
    a4Container.style.borderRadius = "12px";
    a4Container.style.gap = "20px";

    const title = document.createElement("h2");
    title.innerText =
      selectedGroupId === "all"
        ? "Group Summary - All Groups"
        : `Group Summary - ${
            groups.find((g) => g.id === selectedGroupId)?.name || ""
          }`;
    title.style.textAlign = "center";
    title.style.color = "#1e3a8a";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";
    title.style.marginBottom = "12px";
    a4Container.appendChild(title);

    // Summary cards
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

    // Table
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "20px";
    table.innerHTML = `
      <thead style="background:#1e3a8a;color:white;font-size:13px;">
        <tr>
          <th style="padding:10px;text-align:left;">Travel</th>
          <th style="padding:10px;text-align:left;">Plate / Destination</th>
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
            const expenses = calculateTravelExpenses(t, groups);
            const net = income - expenses;
            return `
              <tr style="background:${i % 2 ? "#f9fafb" : "#ffffff"};">
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${t.name}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${getPlateName(
                  t.plateNumber,
                  plates
                )} → ${getDestinationName(t.destination, destinations)}</td>
                <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${getDriverName(
                  t.driver,
                  employees
                )}</td>
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
    link.download = "group_summary_a4.png";
    link.click();

    document.body.removeChild(a4Container);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={selectedGroupId} onValueChange={onGroupChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups
              .slice()
              .sort((a, b) =>
                b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' })
              )
              .map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>


        <Button
          onClick={handleDownloadImage}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <ImageDown className="w-4 h-4" />
          Download Image
        </Button>
      </div>

      {/* 📊 Report Content (visible view) */}
      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
        {/* Summary */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-muted-foreground mb-2">Total Travels</p>
            <p className="text-2xl font-bold text-blue-600">{totalTravels}</p>
          </Card>
          <Card className="p-6 bg-yellow-50">
            <p className="text-sm text-muted-foreground mb-2">Total Tons</p>
            <p className="text-2xl font-bold text-yellow-600">
              {totalTons.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-blue-50">
            <p className="text-sm text-muted-foreground mb-2">Total Income</p>
            <p className="text-2xl font-bold text-blue-600">
              ₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-red-50">
            <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card className="p-6 bg-green-50">
            <p className="text-sm text-muted-foreground mb-2">Net Income</p>
            <p className="text-2xl font-bold text-green-600">
              ₱{netIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Travel</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Plate / Destination
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Driver</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Tons</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Income</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Expenses
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">Net</th>
                </tr>
              </thead>
              <tbody>
                {currentTravels.map((t) => {
                  const income = calculateIncome(t);
                  const expenses = calculateTravelExpenses(t, groups);
                  const net = income - expenses;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">{t.name}</td>
                      <td className="py-3 px-4 text-sm">
                        {getPlateName(t.plateNumber, plates)} →{" "}
                        {getDestinationName(t.destination, destinations)}
                      </td>
                      <td className="py-3 px-4">{getDriverName(t.driver, employees)}</td>
                      <td className="py-3 px-4 text-right">{t.tons.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                        ₱{income.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-semibold">
                        ₱{expenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ₱{net.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

        <p className="text-xs text-muted-foreground text-right">
          Generated on: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
