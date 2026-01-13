import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AddCategoryDialogProps {
  onCategoryAdded: () => void;
}

export const AddCategoryDialog = ({ onCategoryAdded }: AddCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    coming_soon: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/categories/', formData);
      toast.success('Category added successfully!');
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        icon: '',
        coming_soon: false,
      });
      onCategoryAdded();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.detail || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Rabbits, Hamsters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon (emoji or URL)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🐰 or https://icon-url.com/icon.png"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="coming_soon"
              checked={formData.coming_soon}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, coming_soon: checked as boolean })
              }
            />
            <Label htmlFor="coming_soon" className="cursor-pointer">
              Mark as "Coming Soon"
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Adding...' : 'Add Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
