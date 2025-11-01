import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search } from 'lucide-react';
import { TableLoadingState } from '@/components/LoadingState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { EmployeeDialog } from '@/features/employees/components/EmployeeDialog';
import { EmployeesTable } from '@/features/employees/components/EmployeesTable';
import { useEmployees } from '@/features/employees/hooks/useEmployees';

export default function Employees() {
  const { employees, loading, refetch } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const employeesHook = useEmployees(refetch);

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
        <DialogTrigger asChild>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => employeesHook.setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Employee</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </DialogTrigger>
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

        <EmployeesTable
          employees={filteredEmployees}
          onEdit={employeesHook.openEditDialog}
          onDelete={employeesHook.openDeleteDialog}
        />
      </Card>

      <EmployeeDialog
        open={employeesHook.isDialogOpen}
        onOpenChange={employeesHook.setIsDialogOpen}
        employee={employeesHook.editingEmployee}
        onSubmit={employeesHook.handleSubmit}
        isSubmitting={employeesHook.isSubmitting}
      />

      <ConfirmDialog
        open={employeesHook.deleteConfirmOpen}
        onOpenChange={employeesHook.setDeleteConfirmOpen}
        onConfirm={employeesHook.handleDelete}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
