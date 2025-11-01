import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useData } from '@/contexts/DataContext';
import { useCrudOperations } from '@/hooks/useCrudOperations';
import { OtherExpense } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function OtherExpenses() {
  const { otherExpenses } = useData();
  const crud = useCrudOperations<OtherExpense>({
    collectionName: 'otherExpenses',
    successMessages: {
      create: 'Expense added successfully',
      update: 'Expense updated successfully',
      delete: 'Expense deleted successfully',
    },
  });

  const [formData, setFormData] = useState<Omit<OtherExpense, 'id'>>({
    name: '',
    description: '',
    amount: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalExpenses = otherExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (crud.editingItem) {
      await crud.handleUpdate(crud.editingItem.id, formData);
    } else {
      await crud.handleCreate(formData);
    }

    setFormData({ name: '', description: '', amount: 0 });
  };

  const totalPages = Math.ceil(otherExpenses.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentExpenses = otherExpenses.slice(indexOfFirst, indexOfLast);

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Other Expenses</h1>
          <p className="text-muted-foreground">Manage other expenses</p>
        </div>

        {/* ➕ Add Expense Button */}
        <Dialog
          open={crud.isDialogOpen}
          onOpenChange={(open) => {
            crud.setIsDialogOpen(open);
            if (!open) {
              crud.setEditingItem(null);
              setFormData({ name: '', description: '', amount: 0 });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={crud.openCreateDialog}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{crud.editingItem ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
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
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={crud.isSubmitting}>
                {crud.isSubmitting
                  ? 'Processing...'
                  : crud.editingItem
                  ? 'Update'
                  : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
                  {/* TEST */}
      {/* Card Section */}
      <Card className="p-6">
        {/* 🧮 Header inside card */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-foreground"></h2>

          {/* Total at right side */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive">
              ₱{totalExpenses.toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Amount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentExpenses.length > 0 ? (
                currentExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">{expense.name}</td>
                    <td className="py-3 px-4 text-foreground">{expense.description}</td>
                    <td className="py-3 px-4 text-destructive font-semibold">
                      ₱{expense.amount.toLocaleString('en-PH', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          crud.openEditDialog(expense);
                          setFormData({
                            name: expense.name,
                            description: expense.description,
                            amount: expense.amount,
                          });
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => crud.openDeleteDialog(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={crud.deleteConfirmOpen}
        onOpenChange={crud.setDeleteConfirmOpen}
        onConfirm={crud.handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
