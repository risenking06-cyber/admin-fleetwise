import { useState, useEffect } from 'react';
import { Driver, Employee } from '@/types';
import { driversService } from '@/services/firebase';
import { sortTravels } from '@/utils/sorting';
import { toast } from 'sonner';

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [plates, setPlates] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverTravels, setDriverTravels] = useState<any[]>([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const data = await driversService.getAll();
    setDrivers(data);
  };

  const handleSubmit = async (data: { employeeId?: string; wage: number }) => {
    if (isSubmitting) return;
    if (!data.wage || data.wage <= 0) {
      toast.error('Please enter a valid wage');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDriver) {
        await driversService.update(editingDriver.id, { wage: data.wage });
        toast.success('Driver updated successfully');
      } else {
        if (!data.employeeId) {
          toast.error('Please select an employee');
          setIsSubmitting(false);
          return;
        }
        await driversService.create({ employeeId: data.employeeId, wage: data.wage });
        toast.success('Driver added successfully');
      }
      await fetchDrivers();
      setEditingDriver(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;
    await driversService.delete(driverToDelete);
    toast.success('Driver removed successfully');
    fetchDrivers();
    setDeleteConfirmOpen(false);
    setDriverToDelete(null);
  };

  const handleViewDriver = async (driver: Driver) => {
    setSelectedDriver(driver);
    const travels = await driversService.getDriverTravels(driver.employeeId);
    setDriverTravels(sortTravels(travels));
    setViewDialogOpen(true);
  };

  const openEditDialog = (driver: Driver) => {
    setEditingDriver(driver);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDriverToDelete(id);
    setDeleteConfirmOpen(true);
  };

  return {
    drivers,
    employees,
    destinations,
    plates,
    isDialogOpen,
    setIsDialogOpen,
    editingDriver,
    isSubmitting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    viewDialogOpen,
    setViewDialogOpen,
    selectedDriver,
    driverTravels,
    handleSubmit,
    handleDelete,
    handleViewDriver,
    openEditDialog,
    openDeleteDialog,
    fetchDrivers,
    setEmployees,
    setDestinations,
    setPlates,
  };
}
