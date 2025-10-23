import { Employee, Group, Travel, Debt } from '@/types';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  getEmployeeTravels,
  getEmployeeTotalWage,
  getEmployeeTotalDebts,
  getGroupTravels,
} from './utils';

interface EmployeeSummaryTabProps {
  employees: Employee[];
  groups: Group[];
  travels: Travel[];
  debts: Debt[];
  selectedGroupId: string;
  onGroupChange: (value: string) => void;
}

export default function EmployeeSummaryTab({
  employees,
  groups,
  travels,
  debts,
  selectedGroupId,
  onGroupChange,
}: EmployeeSummaryTabProps) {
  // Filter employees based on selected group
  const filteredEmployees = selectedGroupId === 'all' 
    ? employees 
    : employees.filter(emp => {
        const group = groups.find(g => g.id === selectedGroupId);
        return group?.employees.includes(emp.id);
      });

  // Calculate totals
  const totalDaysWorked = filteredEmployees.reduce((sum, emp) => {
    return sum + getEmployeeTravels(emp.id, selectedGroupId === 'all' ? null : selectedGroupId, travels).length;
  }, 0);

  const totalWage = filteredEmployees.reduce((sum, emp) => {
    return sum + getEmployeeTotalWage(emp.id, selectedGroupId === 'all' ? null : selectedGroupId, travels, groups);
  }, 0);

  const totalDebts = filteredEmployees.reduce((sum, emp) => {
    return sum + getEmployeeTotalDebts(emp.id, debts);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Days Worked</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalDaysWorked}</p>
        </Card>
        <Card className="p-6 bg-green-50 dark:bg-green-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Wage</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">₱{totalWage.toFixed(2)}</p>
        </Card>
        <Card className="p-6 bg-yellow-50 dark:bg-yellow-950/20">
          <p className="text-sm text-muted-foreground mb-2">Total Debts (Unpaid)</p>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">₱{totalDebts.toFixed(2)}</p>
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

      {/* Employee Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold">Employee</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Days Worked</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Total Wage</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Unpaid Debt</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => {
                const daysWorked = getEmployeeTravels(employee.id, selectedGroupId === 'all' ? null : selectedGroupId, travels).length;
                const wage = getEmployeeTotalWage(employee.id, selectedGroupId === 'all' ? null : selectedGroupId, travels, groups);
                const debt = getEmployeeTotalDebts(employee.id, debts);

                return (
                  <tr key={employee.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-medium">{employee.name}</td>
                    <td className="py-3 px-4 text-right">{daysWorked}</td>
                    <td className="py-3 px-4 text-right text-green-600 dark:text-green-400 font-semibold">₱{wage.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-yellow-600 dark:text-yellow-400 font-semibold">₱{debt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
