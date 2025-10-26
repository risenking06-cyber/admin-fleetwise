import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Land } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Lands() {
  const [lands, setLands] = useState<Land[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLand, setEditingLand] = useState<Land | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [landToDelete, setLandToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchLands();
  }, []);

  const fetchLands = async () => {
    const querySnapshot = await getDocs(collection(db, 'lands'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Land));
   

    const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    setLands(sorted);
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (editingLand) {
        await updateDoc(doc(db, 'lands', editingLand.id), formData);
        toast.success('Land updated successfully');
      } else {
        await addDoc(collection(db, 'lands'), formData);
        toast.success('Land added successfully');
      }
      await fetchLands();
      setFormData({ name: '' });
      setEditingLand(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!landToDelete) return;
    await deleteDoc(doc(db, 'lands', landToDelete));
    toast.success('Land deleted successfully');
    fetchLands();
    setDeleteConfirmOpen(false);
    setLandToDelete(null);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Lands</h1>
          <p className="text-muted-foreground">Manage land locations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Land
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLand ? 'Edit Land' : 'Add New Land'}</DialogTitle>
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : editingLand ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lands.map((land) => (
              <tr key={land.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                <td className="py-3 px-4 text-foreground">{land.name}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" size="sm" onClick={() => { setEditingLand(land); setFormData({ name: land.name }); setIsDialogOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => {
                        setLandToDelete(land.id);
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
        title="Delete Land"
        description="Are you sure you want to delete this land? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
