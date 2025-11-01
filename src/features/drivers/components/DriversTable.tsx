import { Driver } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';

interface DriversTableProps {
  drivers: Driver[];
  getEmployeeName: (id: string) => string;
  onEdit: (driver: Driver) => void;
  onView: (driver: Driver) => void;
  onDelete: (id: string) => void;
}

export function DriversTable({ drivers, getEmployeeName, onEdit, onView, onDelete }: DriversTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Driver Name</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Wage</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr
              key={driver.id}
              className="border-b border-border hover:bg-secondary/50 transition-colors"
            >
              <td className="py-3 px-4 text-foreground">{getEmployeeName(driver.employeeId)}</td>
              <td className="py-3 px-4 text-foreground">
                {driver.wage ? `₱${driver.wage}` : '-'}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={() => onEdit(driver)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onView(driver)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(driver.id)}>
                    <Trash2 className="w-4 h-4" />
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
