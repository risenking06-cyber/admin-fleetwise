import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Plates() {
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlate, setEditingPlate] = useState<Plate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [plateToDelete, setPlateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPlates();
  }, []);

  const fetchPlates = async () => {
    const querySnapshot = await getDocs(collection(db, 'plates'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plate));

    const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    setPlates(sorted);
  };

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (editingPlate) {
        await updateDoc(doc(db, 'plates', editingPlate.id), formData);
        toast.success('Plate updated successfully');
      } else {
        await addDoc(collection(db, 'plates'), formData);
        toast.success('Plate added successfully');
      }
      await fetchPlates();
      setFormData({ name: '' });
      setEditingPlate(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!plateToDelete) return;
    await deleteDoc(doc(db, 'plates', plateToDelete));
    toast.success('Plate deleted successfully');
    fetchPlates();
    setDeleteConfirmOpen(false);
    setPlateToDelete(null);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Plate Numbers</h1>
          <p className="text-muted-foreground">Manage vehicle plates</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Plate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlate ? 'Edit Plate' : 'Add New Plate'}</DialogTitle>
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : editingPlate ? 'Update' : 'Create'}
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
                    <Button variant="secondary" size="sm" onClick={() => { setEditingPlate(plate); setFormData({ name: plate.name }); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        setPlateToDelete(plate.id);
                        setDeleteConfirmOpen(true);
                      }}
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
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDelete}
        title="Delete Plate"
        description="Are you sure you want to delete this plate number? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
