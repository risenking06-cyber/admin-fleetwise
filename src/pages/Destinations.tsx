import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { Destination } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Destinations() {
  const { destinations } = useData();
  const crud = useCrudOperations<Destination>({
    collectionName: 'destinations',
    successMessages: {
      create: 'Destination added successfully',
      update: 'Destination updated successfully',
      delete: 'Destination deleted successfully',
    },
  });

  // Include color in form data
  const [formData, setFormData] = useState<Omit<Destination, 'id'>>({
    name: '',
    color: '#2563EB',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (crud.editingItem) {
      await crud.handleUpdate(crud.editingItem.id, formData);
    } else {
      await crud.handleCreate(formData);
    }

    setFormData({ name: '', color: '#2563EB' });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Destinations</h1>
          <p className="text-muted-foreground">Manage travel destinations and colors</p>
        </div>

        {/* Dialog for Create/Edit */}
        <Dialog
          open={crud.isDialogOpen}
          onOpenChange={(open) => {
            crud.setIsDialogOpen(open);
            if (!open) {
              crud.setEditingItem(null);
              setFormData({ name: '', color: '#2563EB' });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={crud.openCreateDialog}>
              <Plus className="w-4 h-4" />
              Add Destination
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.editingItem ? 'Edit Destination' : 'Add New Destination'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Color */}
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <span className="text-sm text-muted-foreground">{formData.color}</span>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={crud.isSubmitting}>
                {crud.isSubmitting ? 'Processing...' : crud.editingItem ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Color</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((destination) => (
              <tr
                key={destination.id}
                className="border-b border-border hover:bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-4 text-foreground">{destination.name}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border shadow-sm"
                      style={{ backgroundColor: destination.color || '#2563EB' }}
                    ></div>
                    <span className="text-xs text-muted-foreground">{destination.color}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        crud.openEditDialog(destination);
                        setFormData({ name: destination.name, color: destination.color || '#2563EB' });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => crud.openDeleteDialog(destination.id)}
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

      {/* Confirm Delete */}
      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        onOpenChange={crud.setDeleteConfirmOpen}
        onConfirm={crud.handleDelete}
        title="Delete Destination"
        description="Are you sure you want to delete this destination? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
