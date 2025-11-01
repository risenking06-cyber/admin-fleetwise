import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface EmployeesTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export function EmployeesTable({ employees, onEdit, onDelete }: EmployeesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px]">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
              Name
            </th>
            <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
              Type
            </th>
            <th className="text-right py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-muted/30 transition-colors">
              <td className="py-3 px-3 md:px-4 text-foreground font-medium text-sm md:text-base">
                {employee.name}
              </td>
              <td className="py-3 px-3 md:px-4 text-foreground text-xs md:text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employee.type === 'REGULAR'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {employee.type}
                </span>
              </td>
              <td className="py-3 px-3 md:px-4">
                <div className="flex justify-end gap-1 md:gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(employee)}
                    className="h-8 w-8 md:h-9 md:w-9 p-0"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(employee.id)}
                    className="h-8 w-8 md:h-9 md:w-9 p-0"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
