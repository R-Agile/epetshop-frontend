import { useState } from 'react';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AddCategoryDialogProps {
  onCategoryAdded: () => void;
}

interface Subcategory {
  id: string;
  name: string;
  isNew: boolean;
}

export const AddCategoryDialog = ({ onCategoryAdded }: AddCategoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [subcategoryInput, setSubcategoryInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    image_url: '',
    coming_soon: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create category first
      const categoryResponse = await api.post('/categories/', formData);
      const categoryId = categoryResponse.data._id || categoryResponse.data.id;
      
      // Add subcategories if any
      if (subcategories.length > 0) {
        for (const sub of subcategories) {
          try {
            await api.post('/subcategories/', {
              name: sub.name,
              category_id: categoryId,
            });
          } catch (error: any) {
            console.error('Error adding subcategory:', error);
            // Silently continue - duplicate is ok (already exists)
          }
        }
      }

      toast.success('Category added successfully!');
      setOpen(false);
      setFormData({
        name: '',
        icon: '',
        image_url: '',
        coming_soon: false,
      });
      setSubcategories([]);
      setSubcategoryInput('');
      onCategoryAdded();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.detail || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubcategory = () => {
    if (subcategoryInput.trim() === '') {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    // Check for duplicates (case-insensitive)
    if (subcategories.some(sub => sub.name.toLowerCase() === subcategoryInput.toLowerCase())) {
      toast.error('This subcategory already exists');
      setSubcategoryInput(''); // Clear input after error
      return;
    }

    const newSubcategory: Subcategory = {
      id: Date.now().toString() + Math.random(),
      name: subcategoryInput.trim(),
      isNew: true,
    };

    setSubcategories(prev => [...prev, newSubcategory]);
    setSubcategoryInput(''); // Clear input immediately
  };

  const handleRemoveSubcategory = (id: string) => {
    setSubcategories(subcategories.filter(sub => sub.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
            <Label htmlFor="icon">Icon (emoji or URL)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🐰 or https://icon-url.com/icon.png"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Category Image URL</Label>
            <Input
              id="image_url"
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

          {/* Subcategories Section */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Subcategories</Label>
            <div className="flex gap-2">
              <Input
                value={subcategoryInput}
                onChange={(e) => setSubcategoryInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
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
                    key={sub.id}
                    className="flex items-center justify-between bg-secondary/50 p-2 rounded"
                  >
                    <span className="text-sm capitalize">{sub.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcategory(sub.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
