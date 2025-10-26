import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { Plate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Plates() {
  const { plates } = useData();
  const crud = useCrudOperations<Plate>({
    collectionName: 'plates',
    successMessages: {
      create: 'Plate added successfully',
      update: 'Plate updated successfully',
      delete: 'Plate deleted successfully',
    },
  });

  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (crud.editingItem) {
      await crud.handleUpdate(crud.editingItem.id, formData);
    } else {
      await crud.handleCreate(formData as Omit<Plate, 'id'>);
    }
    
    setFormData({ name: '' });
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Plate Numbers</h1>
          <p className="text-muted-foreground">Manage vehicle plates</p>
        </div>
        <Dialog 
          open={crud.isDialogOpen} 
          onOpenChange={(open) => {
            crud.setIsDialogOpen(open);
            if (!open) {
              crud.setEditingItem(null);
              setFormData({ name: '' });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={crud.openCreateDialog}>
              <Plus className="w-4 h-4" />
              Add Plate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.editingItem ? 'Edit Plate' : 'Add New Plate'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Plate Number</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={crud.isSubmitting}>
                {crud.isSubmitting ? 'Processing...' : crud.editingItem ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Plate Number</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plates.map((plate) => (
              <tr key={plate.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-4 text-foreground">{plate.name}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => {
                        crud.openEditDialog(plate);
                        setFormData({ name: plate.name });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => crud.openDeleteDialog(plate.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        onOpenChange={crud.setDeleteConfirmOpen}
        onConfirm={crud.handleDelete}
        title="Delete Plate"
        description="Are you sure you want to delete this plate number? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
