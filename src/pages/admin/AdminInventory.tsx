import { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, Package, Plus, Minus, Trash2, ChevronDown, Pencil } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AddProductDialog } from '@/components/admin/AddProductDialog';
import { AddCategoryDialog } from '@/components/admin/AddCategoryDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';
import { EditCategoryDialog } from '@/components/admin/EditCategoryDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import api from '@/lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminInventory = () => {
  const { inventory, updateStock, toggleVisibility, loadInventory } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);

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

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (category: any) => {
    setCategoryToEdit(category);
    setEditCategoryDialogOpen(true);
  };

  const deleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await api.delete(`/categories/${categoryToDelete}`);
      toast.success('Category deleted successfully!');
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory(null);
      }
      loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  };

  const handleDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setDeleteProductDialogOpen(true);
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await api.delete(`/inventory/${productToDelete.id}`);
      toast.success('Product deleted successfully!');
      loadInventory();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete product');
    } finally {
      setDeleteProductDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || item.petCategory === selectedCategory || item.id === selectedCategory;
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
            <AddProductDialog onProductAdded={loadInventory} categories={categories} />
          </div>
        </div>

        {/* Categories Management Section */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Categories</h2>
              {selectedCategory && (
                <span className="text-sm text-muted-foreground">({categories.find(c => c._id === selectedCategory)?.name})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <AddCategoryDialog onCategoryAdded={loadCategories} />
              </div>
              <ChevronDown 
                className={`w-5 h-5 transition-transform ${categoriesExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
          
          {categoriesExpanded && (
            <div className="px-6 pb-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div 
                    key={category._id} 
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCategory === category._id 
                        ? 'bg-primary/10 border-primary shadow-sm' 
                        : 'bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30'
                    }`}
                    onClick={() => toggleCategorySelection(category._id)}
                  >
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.coming_soon && (
                          <span className="text-xs text-muted-foreground">Coming Soon</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(category);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(category._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-muted-foreground col-span-full text-center py-4">
                    No categories yet. Add your first category!
                  </p>
                )}
              </div>
            </div>
          )}
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
                        src={item.image || 'https://via.placeholder.com/100?text=No+Image'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
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
                          onClick={async () => {
                            setUpdatingStock(item.id);
                            await updateStock(item.id, item.stock - 1);
                            setUpdatingStock(null);
                          }}
                          disabled={item.stock === 0 || updatingStock === item.id}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-12 text-center font-medium">{item.stock}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={async () => {
                            setUpdatingStock(item.id);
                            await updateStock(item.id, item.stock + 1);
                            setUpdatingStock(null);
                          }}
                          disabled={updatingStock === item.id}
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
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(item);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(item)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

      {/* Edit Category Dialog */}
      {categoryToEdit && (
        <EditCategoryDialog
          category={categoryToEdit}
          open={editCategoryDialogOpen}
          onOpenChange={setEditCategoryDialogOpen}
          onCategoryUpdated={() => {
            setEditCategoryDialogOpen(false);
            setCategoryToEdit(null);
            loadCategories();
          }}
        />
      )}

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={deleteProductDialogOpen} onOpenChange={setDeleteProductDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminInventory;
