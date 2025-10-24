import { useData } from '@/contexts/DataContext';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { TableLoadingState } from '@/components/LoadingState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function Employees() {
  const { employees, loading, refetch } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ name: '', type: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await updateDoc(doc(db, 'employees', editingEmployee.id), formData);
        toast.success('Employee updated successfully');
      } else {
        await addDoc(collection(db, 'employees'), formData);
        toast.success('Employee added successfully');
      }
      setIsDialogOpen(false);
      setFormData({ name: '', type: '' });
      setEditingEmployee(null);
      await refetch();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteDoc(doc(db, 'employees', id));
        toast.success('Employee deleted successfully');
        await refetch();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({ name: employee.name, type: employee.type });
    setIsDialogOpen(true);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Employees</h1>
          <p className="text-sm md:text-base text-muted-foreground">Loading employees data...</p>
        </div>
        <TableLoadingState />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Employees</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your workforce</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Add Employee</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">REGULAR</SelectItem>
                    <SelectItem value="IRREGULAR">IRREGULAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                {editingEmployee ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="mb-4 md:mb-6 p-4 md:p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Type</th>
                <th className="text-right py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-3 md:px-4 text-foreground font-medium text-sm md:text-base">{employee.name}</td>
                  <td className="py-3 px-3 md:px-4 text-foreground text-xs md:text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.type === 'REGULAR' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {employee.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 md:px-4">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEdit(employee)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(employee.id)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
