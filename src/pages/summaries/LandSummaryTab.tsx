import { useState } from 'react';
import { Travel, Group, Employee, Land, Plate, Destination, Driver } from '@/types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  calculateTravelIncome,
  calculateTravelExpenses,
  calculateTravelNet,
  getLandName,
  getPlateName,
  getDestinationName,
  getDriverName,
  getEmployeePresentCount,
} from './utils';

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
  const [selectedLand, setSelectedLand] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedPlate, setSelectedPlate] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter travels based on all selections
  const filteredTravels = travels.filter(travel => {
    if (selectedLand !== 'all' && travel.land !== selectedLand) return false;
    if (selectedDestination !== 'all' && travel.destination !== selectedDestination) return false;
    if (selectedPlate !== 'all' && travel.plateNumber !== selectedPlate) return false;
    if (selectedDriver !== 'all' && travel.driver !== selectedDriver) return false;
    return true;
  });

  // Calculate totals
  const totalTons = filteredTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalTravels = filteredTravels.length;
  const totalIncome = filteredTravels.reduce((sum, t) => sum + calculateTravelIncome(t, groups), 0);
  const totalWage = filteredTravels.reduce((sum, t) => {
    const group = groups.find(g => g.id === t.groupId);
    if (!group) return sum;
    return sum + t.attendance.reduce((wageSum, att) => {
      if (!att.present) return wageSum;
      const presentCount = getEmployeePresentCount(t);
      if (presentCount === 0) return wageSum;
      return wageSum + (group.wage * t.tons) / presentCount;
    }, 0);
  }, 0);
  const totalExpenses = filteredTravels.reduce((sum, t) => {
    return sum + (t.expenses?.reduce((expSum, exp) => expSum + exp.amount, 0) || 0);
  }, 0);
  const netIncome = totalIncome - totalWage - totalExpenses;

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTravels = filteredTravels.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTravels.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="p-6 bg-purple-50 dark:bg-purple-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Tons</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalTons.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Travels</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTravels}</p>
        </Card>
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Income</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₱{totalIncome.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Wage</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">₱{totalWage.toFixed(2)}</p>
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedLand} onValueChange={setSelectedLand}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Land" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Lands</SelectItem>
              {lands.map(land => (
                <SelectItem key={land.id} value={land.id}>{land.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDestination} onValueChange={setSelectedDestination}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Destinations</SelectItem>
              {destinations.map(dest => (
                <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPlate} onValueChange={setSelectedPlate}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Plate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plates</SelectItem>
              {plates.map(plate => (
                <SelectItem key={plate.id} value={plate.id}>{plate.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDriver} onValueChange={setSelectedDriver}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Driver" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {employees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="gap-2 bg-green-600 hover:bg-green-700">
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
                <th className="text-left py-3 px-4 text-sm font-semibold">Land</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Travel</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Plate / Destination</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Driver</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Tons</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Income</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Wage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Expenses</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Net Income</th>
              </tr>
            </thead>
            <tbody>
              {currentTravels.map(travel => {
                const income = calculateTravelIncome(travel, groups);
                const group = groups.find(g => g.id === travel.groupId);
                const wage = travel.attendance.reduce((sum, att) => {
                  if (!att.present) return sum;
                  const presentCount = getEmployeePresentCount(travel);
                  if (!group || presentCount === 0) return sum;
                  return sum + (group.wage * travel.tons) / presentCount;
                }, 0);
                const expenses = travel.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
                const net = income - wage - expenses;

                return (
                  <tr key={travel.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{getLandName(travel.land, lands)}</td>
                    <td className="py-3 px-4">{travel.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {getPlateName(travel.plateNumber, plates)} → {getDestinationName(travel.destination, destinations)}
                    </td>
                    <td className="py-3 px-4">{getDriverName(travel.driver, employees)}</td>
                    <td className="py-3 px-4 text-right">{travel.tons.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">₱{income.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-yellow-600 dark:text-yellow-400">₱{wage.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-red-600 dark:text-red-400 font-semibold">₱{expenses.toFixed(2)}</td>
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
