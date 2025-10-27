import React, { useMemo, useRef } from "react";
import { Employee, Group, Travel, Debt, Driver } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, ImageDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  getEmployeeTravels,
  getEmployeeTotalWage,
  getEmployeeTotalDebts,
  getGroupTravels,
} from "./utils";

interface EmployeeSummaryTabProps {
  employees: Employee[];
  groups: Group[];
  travels: Travel[];
  debts: Debt[];
  drivers: Driver[];
  selectedGroupId: string;
  onGroupChange: (value: string) => void;
}

export default function EmployeeSummaryTab({
  employees,
  groups,
  travels,
  debts,
  drivers,
  selectedGroupId,
  onGroupChange,
}: EmployeeSummaryTabProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  // Helper: parse travel.name to date key
  const parseDateKey = (name?: string | null) => {
    if (!name) return null;
    const ts = Date.parse(String(name).trim());
    if (isNaN(ts)) return null;
    const d = new Date(ts);
    return d.toISOString().slice(0, 10);
  };

  const relevantTravels = useMemo(() => {
    if (selectedGroupId === "all") return travels;
    return getGroupTravels(selectedGroupId, travels);
  }, [selectedGroupId, travels]);

  const workingDayKeys = useMemo(() => {
    const s = new Set<string>();
    for (const t of relevantTravels) {
      const key = parseDateKey(t.name);
      if (key) s.add(key);
    }
    return s;
  }, [relevantTravels]);

  const totalWorkingDays = workingDayKeys.size;

  const filteredEmployees = useMemo(() => {
    if (selectedGroupId === "all") return employees;
    const group = groups.find((g) => g.id === selectedGroupId);
    if (!group) return [];
    return employees.filter((emp) => group.employees.includes(emp.id));
  }, [selectedGroupId, employees, groups]);

  const filteredDrivers = useMemo(() => {
    if (selectedGroupId === "all") {
      // Return all unique drivers that exist in travels
      const driverIds = Array.from(new Set(travels.map((t) => t.driver)));
      return drivers.filter((drv) => driverIds.includes(drv.employeeId));
    }

    // Get only travels for the selected group
    const groupTravels = travels.filter((t) => t.groupId === selectedGroupId);

    // Get unique driver employeeIds from those travels
    const driverIds = Array.from(new Set(groupTravels.map((t) => t.driver)));

    // Filter drivers based on matching employeeId
    return drivers.filter((drv) => driverIds.includes(drv.employeeId));
  }, [selectedGroupId, travels, drivers]);


  console.log(filteredDrivers);

  // 🟩 CHANGE STARTS HERE -------------------------
  // Exclude drivers from employee summary table
  // We gather all employee IDs who acted as driver in any travel.
  const driverIds = useMemo(() => {
    const ids = new Set<string>();
    travels.forEach((t) => {
      if (t.driver) ids.add(t.driver);
    });
    return ids;
  }, [travels]);
  // 🟩 CHANGE ENDS HERE ---------------------------

  const employeeStats = useMemo(() => {
    // 🟩 1. Regular employees (non-drivers)
    const nonDriverEmployees = [...filteredEmployees]
      .filter((emp) => !driverIds.has(emp.id))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      )
      .map((emp) => {
        const empTravels = getEmployeeTravels(
          emp.id,
          selectedGroupId === "all" ? null : selectedGroupId,
          travels
        );

        const empDateKeys = new Set<string>();
        for (const t of empTravels) {
          const key = parseDateKey(t.name);
          if (key) empDateKeys.add(key);
        }

        const daysWorked = empDateKeys.size;
        const wage = getEmployeeTotalWage(
          emp.id,
          selectedGroupId === "all" ? null : selectedGroupId,
          travels,
          groups
        );
        const debt = getEmployeeTotalDebts(emp.id, debts);
        const absentDays = Math.max(0, totalWorkingDays - daysWorked);

        return {
          employee: emp,
          daysWorked,
          absentDays,
          wage,
          debt,
        };
      });

    // 🟩 2. Drivers (based on filteredDrivers)
    const driverStats = filteredDrivers
      .map((drv) => {
        const emp = employees.find((e) => e.id === drv.employeeId);
        if (!emp) return null; // skip if no matching employee found

        // Find travels this driver handled
        const relevantTravelsForDriver = relevantTravels.filter(
          (t) => t.driver === drv.employeeId
        );

        // Compute number of days they drove
        const driverDateKeys = new Set<string>();
        for (const t of relevantTravelsForDriver) {
          const key = parseDateKey(t.name);
          if (key) driverDateKeys.add(key);
        }

        const daysWorked = driverDateKeys.size;
        const wage = (drv.wage || 0) * daysWorked;
        const debt = getEmployeeTotalDebts(drv.employeeId, debts);
        const absentDays = Math.max(0, totalWorkingDays - daysWorked);

        return {
          employee: {
            ...emp,
            name: emp.name + " (Driver)",
          },
          daysWorked,
          absentDays,
          wage,
          debt,
        };
      })
      .filter(Boolean);

    // 🟩 3. Combine both
    const allStats = [...nonDriverEmployees, ...driverStats].sort((a, b) =>
      a.employee.name.localeCompare(b.employee.name, undefined, {
        sensitivity: "base",
      })
    );

    return allStats;
  }, [
    filteredEmployees,
    filteredDrivers,
    selectedGroupId,
    travels,
    groups,
    debts,
    totalWorkingDays,
    driverIds,
    employees,
    relevantTravels,
  ]);


  const totalDaysWorked = employeeStats.reduce((s, st) => s + st.daysWorked, 0);
  const totalWage = employeeStats.reduce((s, st) => s + st.wage, 0);
  const totalDebts = employeeStats.reduce((s, st) => s + st.debt, 0);

  // 💾 PDF Download
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const formatCurrency = (value: number) =>
      `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // 🎨 HEADER
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    const title =
      selectedGroupId === "all"
        ? "Employee Summary - All Groups"
        : `Employee Summary - ${groups.find((g) => g.id === selectedGroupId)?.name || ""
        }`;
    doc.text(title, pageWidth / 2, 13, { align: "center" });

    // 🧾 SUMMARY
    let y = 30;
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text("Summary Overview", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);

    const summaryData = [
      `Total Days Worked: ${totalDaysWorked}`,
      `Total Wage: ${formatCurrency(totalWage)}`,
      `Total Unpaid Debts: ${formatCurrency(totalDebts)}`,
    ];
    summaryData.forEach((line, i) => doc.text(`• ${line}`, 20, y + i * 6));

    // 🧮 TABLE
    const tableData = employeeStats.map(
      ({ employee, daysWorked, absentDays, wage, debt }) => [
        employee.name,
        daysWorked,
        absentDays,
        formatCurrency(wage),
        formatCurrency(debt),
      ]
    );

    y += summaryData.length * 6 + 10;

    autoTable(doc, {
      startY: y,
      head: [["Employee", "Present", "Absent", "Total Wage", "Unpaid Debt"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 11,
      },
      styles: {
        font: "helvetica",
        fontSize: 10,
        textColor: [33, 33, 33],
        cellPadding: 4,
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 14, right: 14 },
    });

    // 📅 FOOTER
    const footerY = pageHeight - 10;
    doc.setFontSize(9);
    doc.setTextColor(130);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, footerY);
    doc.text("© Your Company Name", pageWidth - 14, footerY, {
      align: "right",
    });

    doc.save(`${title}.pdf`);
  };

  // 🖼️ IMAGE DOWNLOAD (unchanged)
  const handleDownloadImage = async () => {
    if (!reportRef.current) return;
    const element = reportRef.current;

    const a4Container = document.createElement("div");
    a4Container.style.width = "794px";
    a4Container.style.height = "1123px";
    a4Container.style.padding = "40px";
    a4Container.style.backgroundColor = "#f9fafb";
    a4Container.style.fontFamily = "'Inter', sans-serif";
    a4Container.style.display = "flex";
    a4Container.style.flexDirection = "column";
    a4Container.style.justifyContent = "flex-start";
    a4Container.style.alignItems = "stretch";
    a4Container.style.boxSizing = "border-box";
    a4Container.style.border = "1px solid #e5e7eb";
    a4Container.style.borderRadius = "12px";
    a4Container.style.gap = "20px";

    const title = document.createElement("h2");
    title.innerText =
      selectedGroupId === "all"
        ? "Employee Summary - All Groups"
        : `Employee Summary - ${groups.find((g) => g.id === selectedGroupId)?.name || ""
        }`;
    title.style.textAlign = "center";
    title.style.color = "#1e3a8a";
    title.style.fontSize = "20px";
    title.style.fontWeight = "700";
    title.style.marginBottom = "12px";
    a4Container.appendChild(title);

    const summary = document.createElement("div");
    summary.style.display = "grid";
    summary.style.gridTemplateColumns = "repeat(3, 1fr)";
    summary.style.gap = "12px";
    summary.innerHTML = `
      <div style="background:#eff6ff;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Total Days Worked</div>
        <div style="color:#1d4ed8;font-size:22px;font-weight:700;">${totalDaysWorked}</div>
      </div>
      <div style="background:#ecfdf5;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Total Wage</div>
        <div style="color:#047857;font-size:22px;font-weight:700;">₱${totalWage.toLocaleString(
      "en-PH",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}</div>
      </div>
      <div style="background:#fefce8;padding:16px;border-radius:10px;text-align:center">
        <div style="color:#64748b;font-size:13px;">Total Debts (Unpaid)</div>
        <div style="color:#ca8a04;font-size:22px;font-weight:700;">₱${totalDebts.toLocaleString(
      "en-PH",
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}</div>
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
          <th style="padding:10px;text-align:left;">Employee</th>
          <th style="padding:10px;text-align:right;">Present</th>
          <th style="padding:10px;text-align:right;">Absent</th>
          <th style="padding:10px;text-align:right;">Total Wage</th>
          <th style="padding:10px;text-align:right;">Unpaid Debt</th>
        </tr>
      </thead>
      <tbody style="font-size:12px;color:#111827;">
        ${employeeStats
        .map(
          ({ employee, daysWorked, absentDays, wage, debt }, i) => `
          <tr style="background:${i % 2 ? "#f9fafb" : "#ffffff"};">
            <td style="padding:8px 10px;border-bottom:1px solid #e5e7eb;">${employee.name}</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e5e7eb;">${daysWorked}</td>
            <td style="padding:8px 10px;text-align:right;color:#dc2626;border-bottom:1px solid #e5e7eb;">${employee.name.includes("(Driver)") ? "-" : absentDays}</td>
            <td style="padding:8px 10px;text-align:right;color:#047857;border-bottom:1px solid #e5e7eb;">₱${wage.toLocaleString(
            "en-PH",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</td>
            <td style="padding:8px 10px;text-align:right;color:#ca8a04;border-bottom:1px solid #e5e7eb;">₱${debt.toLocaleString(
            "en-PH",
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</td>
          </tr>`
        )
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
    link.download = "employee_summary_a4.png";
    link.click();

    document.body.removeChild(a4Container);
  };

  return (
    <div className="space-y-6">
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
                b.name.localeCompare(a.name, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              )
              .map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={handleDownloadImage}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <ImageDown className="w-4 h-4" />
            Download Image
          </Button>
        </div>
      </div>

      {/* 📊 Report Content */}
      <div ref={reportRef} className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 bg-blue-50">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-2">
                Total Days Worked
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {totalDaysWorked}
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 bg-green-50">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-2">Total Wage</p>
              <p className="text-3xl font-bold text-green-600">
                ₱
                {totalWage.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>

          <Card className="p-6 bg-yellow-50">
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground mb-2">
                Total Debts (Unpaid)
              </p>
              <p className="text-3xl font-bold text-yellow-600">
                ₱
                {totalDebts.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">
                    Employee
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Present
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Absent
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Total Wage
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold">
                    Unpaid Debt
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeStats.map(
                  ({ employee, daysWorked, absentDays, wage, debt }) => (
                    <tr
                      key={employee.id}
                      className="border-b border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium">
                        {employee.name}
                      </td>
                      <td className="py-3 px-4 text-right">{daysWorked}</td>
                      <td className="py-3 px-4 text-right text-destructive">
                        {employee.name.includes("(Driver)") ? "-" : absentDays}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-semibold">
                        ₱
                        {wage.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-600 font-semibold">
                        ₱
                        {debt.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
