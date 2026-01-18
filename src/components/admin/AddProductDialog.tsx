import { useState, useEffect } from 'react';
import { Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

interface AddProductDialogProps {
  onProductAdded: () => void;
  categories: any[];
}

export const AddProductDialog = ({ onProductAdded, categories }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    subcategory_id: '',
    images: [''],
    weight: '',
    brand: '',
    age_range: '',
  });

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  const loadSubcategories = async (categoryId: string) => {
    setLoadingSubcategories(true);
    try {
      const response = await api.get(`/subcategories/category/${categoryId}`);
      setSubcategories(response.data);
      // Reset subcategory selection when loading new subcategories
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    } catch (error) {
      toast.error('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !formData.category_id || !formData.subcategory_id) {
      toast.error('Please fill in all required fields (marked with *)');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id && formData.subcategory_id.trim() !== '' ? formData.subcategory_id : null,
        images: formData.images.filter(img => img.trim() !== ''),
        weight: formData.weight || null,
        brand: formData.brand || null,
        age_range: formData.age_range || null,
        is_visible: true,
      };

      const response = await api.post('/inventory/', productData);
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Product added successfully!');
        setOpen(false);
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: '',
          subcategory_id: '',
          images: [''],
          weight: '',
          brand: '',
          age_range: '',
        });
        onProductAdded();
      }
    } catch (error: any) {
      console.error('Error adding product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 403) {
        toast.error('You do not have permission to add products. Admin access required.');
      } else if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to add product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Premium Dog Food"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Pedigree"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Detailed product description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs.) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock <span className="text-red-500">*</span></Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="1kg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value, subcategory_id: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} disabled={cat.coming_soon}>
                      {cat.name} {cat.coming_soon && '(Coming Soon)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory <span className="text-red-500">*</span></Label>
              <Select
                value={formData.subcategory_id}
                onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
                disabled={!formData.category_id || loadingSubcategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingSubcategories ? "Loading..." : formData.category_id ? "Select subcategory" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id || sub._id} value={sub.id || sub._id}>
                      {sub.name.charAt(0).toUpperCase() + sub.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age_range">Age Range</Label>
            <Input
              id="age_range"
              value={formData.age_range}
              onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
              placeholder="All ages, Puppy, Adult, Senior"
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image URL</Label>
            <Input
              value={formData.images[0] || ''}
              onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              ✅ Works: Direct image URLs (ending in .jpg, .png, etc.), Imgur, Cloudinary<br/>
              ✅ Works: Google Drive share links (will be auto-converted)<br/>
              ⚠️ Unsplash: Use "Download" → "Copy Image Address" instead of page URL
            </p>
            {formData.images[0] && formData.images[0].trim() !== '' && (
              <img 
                src={formData.images[0]} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border mt-2"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
