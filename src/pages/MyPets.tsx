import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PawPrint, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PetCard from '@/components/pet/PetCard';
import { useAuth } from '@/context/AuthContext';
import { Pet, PetCategory } from '@/types';

const defaultImages: Record<PetCategory, string> = {
  dogs: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
  birds: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop',
  fishes: 'https://images.unsplash.com/photo-1520302519878-3a57a5aa2c3d?w=400&h=400&fit=crop',
};

const MyPets = () => {
  const { isAuthenticated, pets, addPet, updatePet } = useAuth();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '' as PetCategory | '',
    breed: '',
    age: '',
    image: '',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?redirect=/my-pets');
    }
  }, [isAuthenticated, navigate]);

  const openAddDialog = () => {
    setEditingPet(null);
    setFormData({
      name: '',
      category: '',
      breed: '',
      age: '',
      image: '',
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      category: pet.category,
      breed: pet.breed,
      age: pet.age,
      image: pet.image,
      notes: pet.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;

    const petData = {
      name: formData.name,
      category: formData.category as PetCategory,
      breed: formData.breed,
      age: formData.age,
      image: formData.image || defaultImages[formData.category as PetCategory],
      notes: formData.notes,
    };

    if (editingPet) {
      updatePet(editingPet.id, petData);
    } else {
      addPet(petData);
    }

    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              My <span className="text-primary">Pets</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your furry, feathery, and finned family members
            </p>
          </div>
          <Button variant="hero" onClick={openAddDialog}>
            <Plus className="h-5 w-5 mr-2" />
            Add Pet
          </Button>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border">
            <PawPrint className="h-24 w-24 text-muted-foreground mx-auto mb-6 animate-float" />
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              No Pets Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first pet to get personalized product recommendations and keep track of their info.
            </p>
            <Button variant="default" onClick={openAddDialog}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Pet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onEdit={openEditDialog} />
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="petName">Pet Name</Label>
                <Input
                  id="petName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Buddy"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as PetCategory })
                  }
                  required
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dogs">🐕 Dog</SelectItem>
                    <SelectItem value="cats">🐈 Cat</SelectItem>
                    <SelectItem value="birds">🐦 Bird</SelectItem>
                    <SelectItem value="fishes">🐠 Fish</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="Golden Retriever"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="2 years"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes about your pet..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  {editingPet ? 'Save Changes' : 'Add Pet'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyPets;
