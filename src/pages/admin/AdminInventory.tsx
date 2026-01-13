import { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, Package, Plus, Minus } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AddProductDialog } from '@/components/admin/AddProductDialog';
import { AddCategoryDialog } from '@/components/admin/AddCategoryDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminInventory = () => {
  const { inventory, updateStock, toggleVisibility, loadInventory } = useAdmin();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.name.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-500/20 text-red-600' };
    if (stock < 10) return { label: 'Low Stock', color: 'bg-yellow-500/20 text-yellow-600' };
    return { label: 'In Stock', color: 'bg-green-500/20 text-green-600' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage your product stock and visibility</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name} {cat.coming_soon && '(Soon)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddCategoryDialog onCategoryAdded={loadCategories} />
            <AddProductDialog onProductAdded={loadInventory} categories={categories} />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Visibility</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item.stock);
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <span className="capitalize">Product</span>
                    </TableCell>
                    <TableCell className="font-medium">Rs. {item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateStock(item.id, item.stock - 1)}
                          disabled={item.stock === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.stock}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateStock(item.id, item.stock + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={item.isVisible}
                          onCheckedChange={() => toggleVisibility(item.id)}
                        />
                        {item.isVisible ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Total Products</p>
            <p className="text-2xl font-bold text-foreground">{inventory.length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
            <p className="text-2xl font-bold text-yellow-600">{inventory.filter(i => i.stock < 10 && i.stock > 0).length}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <p className="text-sm text-muted-foreground">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{inventory.filter(i => i.stock === 0).length}</p>
          </div>
        </div>
      </div>

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <EditProductDialog
          productId={selectedProduct.id}
          product={selectedProduct}
          categories={categories}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onProductUpdated={() => {
            setEditDialogOpen(false);
            setSelectedProduct(null);
            loadInventory();
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
