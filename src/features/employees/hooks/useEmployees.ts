import { useState } from 'react';
import { Employee } from '@/types';
import { employeesService } from '@/services/firebase';
import { toast } from 'sonner';

export function useEmployees(refetch: () => Promise<void>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const handleSubmit = async (data: Omit<Employee, 'id'>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingEmployee) {
        await employeesService.update(editingEmployee.id, data);
        toast.success('Employee updated successfully');
      } else {
        await employeesService.create(data);
        toast.success('Employee added successfully');
      }
      await refetch();
      setEditingEmployee(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await employeesService.delete(employeeToDelete);
      toast.success('Employee deleted successfully');
      await refetch();
    } catch (error) {
      toast.error('Failed to delete employee');
    }
    setDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setEmployeeToDelete(id);
    setDeleteConfirmOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingEmployee,
    isSubmitting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleSubmit,
    handleDelete,
    openEditDialog,
    openDeleteDialog,
  };
}
