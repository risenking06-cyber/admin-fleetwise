import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Debt, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Eye, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ 
    employeeId: '', 
    amount: 0, 
    description: '', 
    date: new Date().toISOString().split('T')[0],
    paid: false
  });

  useEffect(() => {
    fetchEmployees();
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    const querySnapshot = await getDocs(collection(db, 'debts'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
    setDebts(data);
  };

  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));

    // ✅ Sort alphabetically by name (case-insensitive)
    const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));

    setEmployees(sorted);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDebt) {
        await updateDoc(doc(db, 'debts', editingDebt.id), formData);
        toast.success('Debt updated successfully');
      } else {
        await addDoc(collection(db, 'debts'), { ...formData, paid: false });
        toast.success('Debt added successfully');
      }
      setIsDialogOpen(false);
      setEditingDebt(null);
      setFormData({ employeeId: '', amount: 0, description: '', date: new Date().toISOString().split('T')[0], paid: false });
      fetchDebts();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    const t = toast.loading('Deleting debt...');
    try {
      await deleteDoc(doc(db, 'debts', id));
      toast.success('Debt deleted successfully', { id: t });
      fetchDebts();
    } catch {
      toast.error('Failed to delete debt', { id: t });
    }
  };

  const handleMarkAsPaid = async (debt: Debt) => {
  const t = toast.loading('Marking as paid...');
  try {
    await updateDoc(doc(db, 'debts', debt.id), { paid: true });
    toast.success('Debt marked as paid', { id: t });
    fetchDebts();
  } catch {
    toast.error('Failed to mark as paid', { id: t });
  }
};


  const getEmployeeDebts = (employeeId: string) => debts.filter(d => d.employeeId === employeeId);
  const getEmployeeTotalDebt = (employeeId: string) =>
    getEmployeeDebts(employeeId).filter(d => !d.paid).reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Employee Debts</h1>
        <p className="text-muted-foreground">Manage debts by employee</p>
      </div>

      {/* Employee List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Total Debt</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-border hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4 text-foreground font-medium">{employee.name}</td>
                  <td className="py-3 px-4 text-destructive font-semibold">
                    ₱{getEmployeeTotalDebt(employee.id).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      onClick={() => setSelectedEmployee(employee)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant='secondary'
                      className="gap-1"
                      onClick={() => {
                        setEditingDebt(null);
                        setFormData({
                          employeeId: employee.id,
                          amount: 0,
                          description: '',
                          date: new Date().toISOString().split('T')[0],
                          paid: false,
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>

                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>


      {/* Add/Edit Debt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDebt ? 'Edit Debt' : 'Add Debt'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={formData.employeeId}
                onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {editingDebt ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Details Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-2xl">
          {selectedEmployee && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEmployee.name}'s Debts</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <p className="text-lg font-semibold text-destructive">
                  Total: ₱{getEmployeeTotalDebt(selectedEmployee.id).toFixed(2)}
                </p>

                <table className="w-full border-t">
                  <thead>
                    <tr>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Description</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getEmployeeDebts(selectedEmployee.id).map((debt) => (
                      <tr key={debt.id} className="border-t">
                        <td className="py-2 text-destructive font-semibold">₱{debt.amount}</td>
                        <td className="py-2">{new Date(debt.date).toLocaleDateString()}</td>
                        <td className="py-2 text-sm">{debt.description}</td>
                        <td className="py-2 text-sm">
                          {debt.paid ? (
                            <span className="text-green-600 font-semibold">Paid</span>
                          ) : (
                            <span className="text-yellow-600 font-semibold">Unpaid</span>
                          )}
                        </td>
                        <td className="py-2 text-right space-x-2">
                          {!debt.paid && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-transparent active:bg-transparent hover:text-green-600"
                              onClick={() => handleMarkAsPaid(debt)}
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setEditingDebt(debt);
                              setFormData({
                                employeeId: debt.employeeId,
                                amount: debt.amount,
                                description: debt.description,
                                date: debt.date,
                                paid: debt.paid
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              toast.message('Delete this debt?', {
                                description: debt.description,
                                action: {
                                  label: 'Confirm',
                                  onClick: () => handleDelete(debt.id),
                                },
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
