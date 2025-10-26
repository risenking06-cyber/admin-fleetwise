import { useState } from 'react';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface UseCrudOperationsOptions<T> {
  collectionName: string;
  onSuccess?: () => void | Promise<void>;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
}

export function useCrudOperations<T extends { id: string }>({
  collectionName,
  onSuccess,
  successMessages = {
    create: 'Created successfully',
    update: 'Updated successfully',
    delete: 'Deleted successfully',
  },
}: UseCrudOperationsOptions<T>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleCreate = async (data: Omit<T, 'id'>) => {
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, collectionName), data);
      toast.success(successMessages.create);
      if (onSuccess) await onSuccess();
      setIsDialogOpen(false);
      return true;
    } catch (error) {
      console.error(`Error creating ${collectionName}:`, error);
      toast.error('Operation failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Omit<T, 'id'>>) => {
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, collectionName, id), data as any);
      toast.success(successMessages.update);
      if (onSuccess) await onSuccess();
      setIsDialogOpen(false);
      setEditingItem(null);
      return true;
    } catch (error) {
      console.error(`Error updating ${collectionName}:`, error);
      toast.error('Operation failed');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteDoc(doc(db, collectionName, itemToDelete));
      toast.success(successMessages.delete);
      if (onSuccess) await onSuccess();
    } catch (error) {
      console.error(`Error deleting ${collectionName}:`, error);
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: T) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  return {
    // State
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    setEditingItem,
    isSubmitting,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    
    // Operations
    handleCreate,
    handleUpdate,
    handleDelete,
    
    // Helpers
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
  };
}
