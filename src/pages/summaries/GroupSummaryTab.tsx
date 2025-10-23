import { useState } from 'react';
import { Group, Travel, Employee, Plate, Destination } from '@/types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getGroupTravels,
  calculateTravelIncome,
  calculateTravelExpenses,
  calculateTravelNet,
  getPlateName,
  getDestinationName,
  getDriverName,
  getEmployeePresentCount,
} from './utils';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter travels based on selected group
  const filteredTravels = selectedGroupId === 'all'
    ? travels
    : getGroupTravels(selectedGroupId, travels);

  // Calculate totals
  const totalTravels = filteredTravels.length;
  const totalTons = filteredTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalIncome = filteredTravels.reduce((sum, t) => sum + calculateTravelIncome(t, groups), 0);
  const totalExpenses = filteredTravels.reduce((sum, t) => sum + calculateTravelExpenses(t, groups), 0);
  const netIncome = totalIncome - totalExpenses;

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTravels = filteredTravels.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTravels.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Travels</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTravels}</p>
        </Card>
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Tons</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalTons.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₱{totalIncome.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-red-50 dark:bg-red-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Expenses</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">₱{totalExpenses.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-green-50 dark:bg-green-950/20">
          <p className="text-sm text-muted-foreground mb-2">Net Income</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">₱{netIncome.toFixed(2)}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <Select value={selectedGroupId} onValueChange={onGroupChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map(group => (
              <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4" />
          Download PDF
        </Button>
      </div>

      {/* Travel Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold">Travel</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Plate / Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Driver</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Tons</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Income</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Wage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Expenses</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Net</th>
              </tr>
            </thead>
            <tbody>
              {currentTravels.map(travel => {
                const income = calculateTravelIncome(travel, groups);
                const expenses = calculateTravelExpenses(travel, groups);
                const net = income - expenses;
                const group = groups.find(g => g.id === travel.groupId);
                const wageExpenses = travel.attendance.reduce((sum, att) => {
                  if (!att.present) return sum;
                  const presentCount = getEmployeePresentCount(travel);
                  if (!group || presentCount === 0) return sum;
                  return sum + (group.wage * travel.tons) / presentCount;
                }, 0);
                const otherExpenses = expenses - wageExpenses;

                return (
                  <tr key={travel.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{travel.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {getPlateName(travel.plateNumber, plates)} → {getDestinationName(travel.destination, destinations)}
                    </td>
                    <td className="py-3 px-4">{getDriverName(travel.driver, employees)}</td>
                    <td className="py-3 px-4 text-right">{travel.tons.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">₱{income.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">₱{wageExpenses.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-semibold">₱{otherExpenses.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">₱{net.toFixed(2)}</td>
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
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
