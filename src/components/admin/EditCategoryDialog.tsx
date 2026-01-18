import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Subcategory {
  _id?: string;
  id?: string;
  name: string;
  isNew: boolean;
}

interface EditCategoryDialogProps {
  category: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryUpdated: () => void;
}

export const EditCategoryDialog = ({
  category,
  open,
  onOpenChange,
  onCategoryUpdated,
}: EditCategoryDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryInput, setSubcategoryInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    image_url: '',
    coming_soon: false,
  });

  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name || '',
        icon: category.icon || '',
        image_url: category.image_url || '',
        coming_soon: category.coming_soon || false,
      });
      loadSubcategories(category._id);
    }
  }, [category, open]);

  const loadSubcategories = async (categoryId: string) => {
    try {
      const response = await api.get(`/subcategories/category/${categoryId}`);
      setSubcategories(
        response.data.map((sub: any) => ({
          _id: sub.id || sub._id,
          name: sub.name,
          isNew: false,
        }))
      );
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleAddSubcategory = () => {
    if (subcategoryInput.trim() === '') {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    // Check for duplicates
    if (subcategories.some(sub => sub.name.toLowerCase() === subcategoryInput.toLowerCase())) {
      toast.error('This subcategory already exists');
      return;
    }

    const newSubcategory: Subcategory = {
      id: Date.now().toString(),
      name: subcategoryInput.trim(),
      isNew: true,
    };

    setSubcategories([...subcategories, newSubcategory]);
    setSubcategoryInput('');
  };

  const handleRemoveSubcategory = async (sub: Subcategory) => {
    if (!sub.isNew && sub._id) {
      try {
        await api.delete(`/subcategories/${sub._id}`);
        toast.success('Subcategory deleted successfully');
      } catch (error: any) {
        console.error('Error deleting subcategory:', error);
        toast.error(error.response?.data?.detail || 'Failed to delete subcategory');
        return;
      }
    }
    setSubcategories(subcategories.filter(s => s._id !== sub._id && s.id !== sub.id));
  };

  const handleEditSubcategory = (id: string | undefined, newName: string) => {
    setSubcategories(
      subcategories.map(sub =>
        (sub._id === id || sub.id === id) ? { ...sub, name: newName } : sub
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update category
      await api.put(`/categories/${category._id}`, formData);

      // Add new subcategories
      for (const sub of subcategories) {
        if (sub.isNew) {
          try {
            await api.post('/subcategories/', {
              name: sub.name,
              category_id: category._id,
            });
          } catch (error: any) {
            console.error('Error adding subcategory:', error);
          }
        }
      }

      toast.success('Category updated successfully!');
      onOpenChange(false);
      onCategoryUpdated();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.detail || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Category Name *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., Rabbits, Hamsters"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-icon">Icon (emoji or URL)</Label>
            <Input
              id="edit-icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🐰 or https://icon-url.com/icon.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image_url">Category Image URL</Label>
            <Input
              id="edit-image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/category-image.jpg"
            />
            <p className="text-xs text-muted-foreground">Enter a valid image URL for the category</p>
            {formData.image_url && formData.image_url.trim() !== '' && (
              <img 
                src={formData.image_url} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border mt-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-coming_soon"
              checked={formData.coming_soon}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, coming_soon: checked as boolean })
              }
            />
            <Label htmlFor="edit-coming_soon" className="cursor-pointer">
              Mark as "Coming Soon"
            </Label>
          </div>

          {/* Subcategories Section */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Subcategories</Label>
            <div className="flex gap-2">
              <Input
                value={subcategoryInput}
                onChange={(e) => setSubcategoryInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubcategory()}
                placeholder="Enter subcategory name"
              />
              <Button
                type="button"
                onClick={handleAddSubcategory}
                variant="outline"
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Subcategories List */}
            {subcategories.length > 0 && (
              <div className="space-y-2 mt-3">
                {subcategories.map((sub) => (
                  <div
                    key={sub._id || sub.id}
                    className="flex items-center justify-between bg-secondary/50 p-2 rounded group hover:bg-secondary/70 transition"
                  >
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => handleEditSubcategory(sub._id || sub.id, e.target.value)}
                      className="text-sm bg-transparent border-none outline-none flex-1 capitalize hover:bg-white/20 px-1 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub)}
                      className="text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
