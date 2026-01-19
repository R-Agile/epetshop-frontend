import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, PawPrint, X, Loader2, Upload, Camera } from 'lucide-react';
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
import PetCard from '@/components/pet/PetCard';
import { useAuth } from '@/context/AuthContext';
import { Pet, PetCategory } from '@/types';
import { toast } from 'sonner';

const defaultImages: Record<PetCategory, string> = {
  dogs: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
  cats: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
  birds: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop',
  fishes: 'https://images.unsplash.com/photo-1520302519878-3a57a5aa2c3d?w=400&h=400&fit=crop',
};

const MyPets = () => {
  const { isAuthenticated, isLoading, pets, addPet, updatePet } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    breed: '',
    age: '',
    image: '',
    notes: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth?redirect=/my-pets');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
    setImagePreview('');
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
    setImagePreview(pet.image);
    setIsDialogOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData({ ...formData, image: base64String });
      setImagePreview(base64String);
      toast.success('Image uploaded successfully');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      toast.error('Please enter pet type');
      return;
    }

    setIsSubmitting(true);

    const petData = {
      name: formData.name,
      category: formData.category as PetCategory,
      breed: formData.breed,
      age: formData.age,
      image: formData.image || defaultImages['dogs'],
      notes: formData.notes,
    };

    try {
      if (editingPet) {
        await updatePet(editingPet.id, petData);
      } else {
        await addPet(petData);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving pet:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner during authentication check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label>Pet Photo</Label>
                <div className="flex gap-4 items-start">
                  {/* Image Preview */}
                  <div className="relative w-32 h-32 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Pet preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, image: '' });
                          }}
                          className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={triggerFileInput}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Pet Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName" className="text-sm">
                    Pet Name *
                  </Label>
                  <Input
                    id="petName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Buddy"
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="petType" className="text-sm">
                    Pet Type *
                  </Label>
                  <Input
                    id="petType"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Dog, Cat, Rabbit, Parrot"
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter any pet type (no limits)
                  </p>
                </div>

                <div>
                  <Label htmlFor="breed" className="text-sm">
                    Breed *
                  </Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="German Shepherd"
                    required
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="text-sm">
                    Age *
                  </Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="2 years"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes about your pet..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : editingPet ? (
                    'Save Changes'
                  ) : (
                    'Add Pet'
                  )}
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
