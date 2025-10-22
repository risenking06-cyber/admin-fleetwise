import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Employee, Group } from '@/types';

export interface GroupFormData {
  name: string;
  wage: number;
  employees: string[];
}

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  editingGroup?: Group | null;
  initial?: GroupFormData;
  onSubmit: (data: GroupFormData) => Promise<void>;
}

export default function GroupDialog({
  open,
  onOpenChange,
  employees,
  editingGroup,
  initial,
  onSubmit,
}: GroupDialogProps) {
  const [form, setForm] = React.useState<GroupFormData>(initial || { name: '', wage: 0, employees: [] });

  React.useEffect(() => {
    if (editingGroup) {
      setForm({
        name: editingGroup.name,
        wage: editingGroup.wage,
        employees: editingGroup.employees || [],
      });
    } else {
      setForm(initial || { name: '', wage: 0, employees: [] });
    }
  }, [editingGroup, initial, open]);

  const toggleEmployee = (id: string) =>
    setForm((f) => ({
      ...f,
      employees: f.employees.includes(id)
        ? f.employees.filter((x) => x !== id)
        : [...f.employees, id],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // ✅ Sort employees alphabetically by name
  const sortedEmployees = [...employees].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <div>
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="group-wage">Wage</Label>
            <Input
              id="group-wage"
              type="number"
              value={form.wage}
              onChange={(e) => setForm({ ...form, wage: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <Label>Select Employees</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
              {sortedEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`employee-${emp.id}`}
                    checked={form.employees.includes(emp.id)}
                    onCheckedChange={() => toggleEmployee(emp.id)}
                  />
                  <label htmlFor={`employee-${emp.id}`} className="text-sm cursor-pointer">
                    {emp.name} - {emp.type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {editingGroup ? 'Update' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
