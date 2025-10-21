import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ name: '', wage: 0, employees: [] as string[] });

  useEffect(() => {
    fetchGroups();
    fetchEmployees();
  }, []);

  const fetchGroups = async () => {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
    setGroups(data);
  };

  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
    setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), formData);
        toast.success('Group updated successfully');
      } else {
        await addDoc(collection(db, 'groups'), formData);
        toast.success('Group added successfully');
      }
      setIsDialogOpen(false);
      setFormData({ name: '', wage: 0, employees: [] });
      setEditingGroup(null);
      fetchGroups();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'groups', id));
      toast.success('Group deleted successfully');
      fetchGroups();
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.includes(employeeId)
        ? prev.employees.filter(id => id !== employeeId)
        : [...prev.employees, employeeId]
    }));
  };

  const getEmployeeNames = (employeeIds: string[]) => {
    return employeeIds
      .map(id => employees.find(e => e.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Organize employees into groups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="wage">Wage</Label>
                <Input
                  id="wage"
                  type="number"
                  value={formData.wage}
                  onChange={(e) => setFormData({ ...formData, wage: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Select Employees</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={formData.employees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <label htmlFor={`employee-${employee.id}`} className="text-sm cursor-pointer">
                        {employee.name} - {employee.type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">{editingGroup ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Group Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Wage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employees</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground">{group.name}</td>
                  <td className="py-3 px-4 text-foreground">${group.wage}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{getEmployeeNames(group.employees) || 'No employees'}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { 
                        setEditingGroup(group); 
                        setFormData({ name: group.name, wage: group.wage, employees: group.employees }); 
                        setIsDialogOpen(true); 
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(group.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
