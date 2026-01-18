import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pet } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface PetCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
}

const categoryIcons: Record<string, string> = {
  dogs: '🐕',
  cats: '🐈',
  birds: '🐦',
  fishes: '🐠',
};

const PetCard = ({ pet, onEdit }: PetCardProps) => {
  const { deletePet } = useAuth();

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border/50 card-hover">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={pet.image}
          alt={pet.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{categoryIcons[pet.category]}</span>
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">
              {pet.name}
            </h3>
            {pet.username && (
              <p className="text-xs text-muted-foreground">Owner: {pet.username}</p>
            )}
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-1">
          <span className="font-medium">Breed:</span> {pet.breed}
        </p>
        <p className="text-muted-foreground text-sm mb-3">
          <span className="font-medium">Age:</span> {pet.age}
        </p>
        {pet.notes && (
          <p className="text-sm text-foreground/80 mb-4 line-clamp-2">
            {pet.notes}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="soft"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(pet)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deletePet(pet.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PetCard;
