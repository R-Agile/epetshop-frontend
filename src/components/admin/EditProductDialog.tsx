import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface EditProductDialogProps {
  productId: string;
  product: any;
  onProductUpdated: () => void;
  categories: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProductDialog = ({ 
  productId, 
  product, 
  onProductUpdated, 
  categories,
  open,
  onOpenChange
}: EditProductDialogProps) => {
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
    } catch (error) {
      toast.error('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  useEffect(() => {
    const loadProductData = async () => {
      if (productId && open) {
        try {
          const response = await api.get(`/inventory/${productId}`);
          const data = response.data;
          
          setFormData({
            name: data.name || '',
            description: data.description || '',
            price: data.price?.toString() || '',
            stock: data.stock?.toString() || '',
            category_id: data.category_id || '',
            subcategory_id: data.subcategory_id || '',
            images: data.images && data.images.length > 0 ? data.images : [''],
            weight: data.weight || '',
            brand: data.brand || '',
            age_range: data.age_range || '',
          });
        } catch (error) {
          console.error('Error loading product:', error);
          toast.error('Failed to load product details');
        }
      }
    };
    
    loadProductData();
  }, [productId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock), // Make sure stock is a number
        category_id: formData.category_id,
        subcategory_id: formData.subcategory_id && formData.subcategory_id.trim() !== '' ? formData.subcategory_id : null,
        images: formData.images.filter(img => img.trim() !== ''),
        weight: formData.weight || null,
        brand: formData.brand || null,
        age_range: formData.age_range || null,
      };

      console.log('Submitting product data:', productData); // Debug log
      
      await api.put(`/inventory/${productId}`, productData);
      toast.success('Product updated successfully!');
      onOpenChange(false);
      onProductUpdated();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.detail || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs.) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id} disabled={cat.coming_soon}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory *</Label>
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
            />
          </div>

          <div className="space-y-2">
            <Label>Product Image URL</Label>
            <Input
              value={formData.images[0]}
              onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
