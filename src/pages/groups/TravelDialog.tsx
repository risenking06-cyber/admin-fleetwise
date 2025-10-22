import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee, Travel, Land, Plate, Destination, Driver } from '@/types';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export interface TravelFormData {
  name: string;
  land: string;
  driver: string;
  plateNumber: string;
  destination: string;
  ticket?: string;
  pstc?:string;
  tons: number;
  bags?: number;
  sugarcane_price?: number;
  molasses?: number;
  molasses_price?: number;
  attendance: { employeeId: string; present: boolean }[];
  expenses: { name: string; amount: number }[];
}

interface TravelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[];
  editingTravel?: Travel | null;
  initialAttendance?: { employeeId: string; present: boolean }[];
  onSubmit: (data: TravelFormData) => Promise<void>;
}

export default function TravelDialog({
  open,
  onOpenChange,
  employees,
  lands,
  plates,
  destinations,
  drivers,
  editingTravel,
  initialAttendance,
  onSubmit,
}: TravelDialogProps) {
  const defaultForm: TravelFormData = {
    name: '',
    land: '',
    driver: '',
    plateNumber: '',
    destination: '',
    ticket: '',
    pstc:'',
    tons: 0,
    bags: 0,
    sugarcane_price: 0,
    molasses: 0,
    molasses_price: 0,
    attendance: initialAttendance || [],
    expenses: [],
  };

  const [form, setForm] = React.useState<TravelFormData>(defaultForm);

  React.useEffect(() => {
    if (editingTravel) {
      setForm({
        name: editingTravel.name,
        land: editingTravel.land,
        driver: editingTravel.driver,
        plateNumber: editingTravel.plateNumber,
        destination: editingTravel.destination,
        pstc:editingTravel.pstc,
        ticket: editingTravel.ticket || '',
        tons: editingTravel.tons || 0,
        bags: editingTravel.bags || 0,
        sugarcane_price: editingTravel.sugarcane_price || 0,
        molasses: editingTravel.molasses || 0,
        molasses_price: editingTravel.molasses_price || 0,
        attendance: editingTravel.attendance || [],
        expenses: editingTravel.expenses || [],
      });
    } else {
      setForm(defaultForm);
    }
  }, [editingTravel, initialAttendance, open]);

  const toggleAttendance = (employeeId: string) =>
    setForm((f) => ({
      ...f,
      attendance: f.attendance.map((a) =>
        a.employeeId === employeeId ? { ...a, present: !a.present } : a
      ),
    }));

  const handleExpenseChange = (idx: number, key: 'name' | 'amount', value: string | number) => {
    setForm((f) => {
      const updated = [...f.expenses];
      if (!updated[idx]) updated[idx] = { name: '', amount: 0 };
      updated[idx] = { ...updated[idx], [key]: key === 'amount' ? Number(value) : String(value) };
      return { ...f, expenses: updated };
    });
  };

  const addExpense = () =>
    setForm((f) => ({ ...f, expenses: [...(f.expenses || []), { name: '', amount: 0 }] }));

  const removeExpense = (idx: number) =>
    setForm((f) => ({ ...f, expenses: f.expenses.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  // ✅ Sort data alphabetically for clean dropdowns
  const sortedLands = [...lands].sort((a, b) => a.name.localeCompare(b.name));
  const sortedPlates = [...plates].sort((a, b) => a.name.localeCompare(b.name));
  const sortedDestinations = [...destinations].sort((a, b) => a.name.localeCompare(b.name));
  const sortedDrivers = [...drivers].sort((a, b) => {
    const empA = employees.find((e) => e.id === a.employeeId);
    const empB = employees.find((e) => e.id === b.employeeId);
    return (empA?.name || '').localeCompare(empB?.name || '');
  });
  const sortedAttendance = [...form.attendance].sort((a, b) => {
    const empA = employees.find((e) => e.id === a.employeeId);
    const empB = employees.find((e) => e.id === b.employeeId);
    return (empA?.name || '').localeCompare(empB?.name || '');
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTravel ? 'Edit Travel' : 'Add New Travel'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          {/* ======== DATE + BASIC DETAILS ======== */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!form.name ? "text-muted-foreground" : ""}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.name ? form.name : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.name ? new Date(form.name) : undefined}
                    onSelect={(date) =>
                      setForm({
                        ...form,
                        name: date ? format(date, "MMMM d, yyyy") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Ticket No</Label>
              <Input value={form.ticket} onChange={(e) => setForm({ ...form, ticket: e.target.value })} />
            </div>

            {/* ======== SORTED SELECTS ======== */}
            <div>
              <Label>Land</Label>
              <Select value={form.land} onValueChange={(v) => setForm({ ...form, land: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select land" />
                </SelectTrigger>
                <SelectContent>
                  {sortedLands.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Driver</Label>
              <Select value={form.driver} onValueChange={(v) => setForm({ ...form, driver: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {sortedDrivers.map((d) => {
                    const emp = employees.find((e) => e.id === d.employeeId);
                    return emp ? <SelectItem key={d.id} value={emp.id}>{emp.name}</SelectItem> : null;
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Plate Number</Label>
              <Select value={form.plateNumber} onValueChange={(v) => setForm({ ...form, plateNumber: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plate" />
                </SelectTrigger>
                <SelectContent>
                  {sortedPlates.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Destination</Label>
              <Select value={form.destination} onValueChange={(v) => setForm({ ...form, destination: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {sortedDestinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ======== NUMERIC FIELDS ======== */}
            <div>
              <Label>Tons</Label>
              <Input
                type="number"
                step="0.01"
                value={form.tons}
                onChange={(e) => setForm({ ...form, tons: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Bags</Label>
              <Input
                type="number"
                value={form.bags}
                onChange={(e) => setForm({ ...form, bags: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Sugarcane Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.sugarcane_price}
                onChange={(e) => setForm({ ...form, sugarcane_price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Molasses</Label>
              <Input
                type="number"
                step="0.01"
                value={form.molasses}
                onChange={(e) => setForm({ ...form, molasses: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Molasses Price</Label>
              <Input
                type="number"
                step="0.01"
                value={form.molasses_price}
                onChange={(e) => setForm({ ...form, molasses_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>PSTC</Label>
              <Input value={form.pstc} onChange={(e) => setForm({ ...form, pstc: e.target.value })} />
            </div>
          </div>

          {/* ======== EXPENSES ======== */}
          <div>
            <Label>Expenses</Label>
            <div className="mt-2 space-y-2">
              {form.expenses.length === 0 && <p className="text-xs text-muted-foreground">No expenses added yet.</p>}

              {form.expenses.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="Expense name"
                    value={exp.name}
                    onChange={(e) => handleExpenseChange(idx, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Amount"
                    type="number"
                    value={exp.amount}
                    onChange={(e) => handleExpenseChange(idx, 'amount', Number(e.target.value))}
                    className="w-32"
                  />
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeExpense(idx)}>
                    Remove
                  </Button>
                </div>
              ))}

              <div className="pt-2">
                <Button type="button" variant="secondary" size="sm" onClick={addExpense}>
                  + Add Expense
                </Button>
              </div>
            </div>
          </div>

          {/* ======== ATTENDANCE (SORTED) ======== */}
          <div>
            <Label>Attendance</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
              {sortedAttendance.map((att) => {
                const employee = employees.find((e) => e.id === att.employeeId);
                if (!employee) return null;
                return (
                  <div key={att.employeeId} className="flex items-center gap-2">
                    <Checkbox
                      id={`attendance-${att.employeeId}`}
                      checked={att.present}
                      onCheckedChange={() => toggleAttendance(att.employeeId)}
                    />
                    <label htmlFor={`attendance-${att.employeeId}`} className="text-sm cursor-pointer">
                      {employee.name} - {employee.type}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" className="w-full">
            {editingTravel ? 'Update' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
