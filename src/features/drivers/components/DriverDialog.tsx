import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Driver, Employee } from '@/types';

interface DriverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: Driver | null;
  availableEmployees: Employee[];
  onSubmit: (data: { employeeId?: string; wage: number }) => Promise<void>;
  isSubmitting: boolean;
}

export function DriverDialog({
  open,
  onOpenChange,
  driver,
  availableEmployees,
  onSubmit,
  isSubmitting,
}: DriverDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [driverWage, setDriverWage] = useState('');

  useEffect(() => {
    if (driver) {
      setDriverWage(driver.wage?.toString() || '');
    } else {
      setSelectedEmployeeId('');
      setDriverWage('');
    }
  }, [driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = driver
      ? { wage: Number(driverWage) }
      : { employeeId: selectedEmployeeId, wage: Number(driverWage) };
    await onSubmit(data);
    setSelectedEmployeeId('');
    setDriverWage('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Assign Employee as Driver'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!driver && (
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="wage">Wage</Label>
            <Input
              id="wage"
              type="number"
              value={driverWage}
              onChange={(e) => setDriverWage(e.target.value)}
              placeholder="Enter driver wage"
              min="0"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : driver ? 'Update Driver' : 'Assign Driver'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
