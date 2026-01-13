import { Link } from 'react-router-dom';
import { PetCategory } from '@/types';

interface CategoryCardProps {
  category: PetCategory;
  image: string;
  productCount: number;
}

const categoryLabels: Record<PetCategory, string> = {
  dogs: 'Dogs',
  cats: 'Cats',
  birds: 'Birds',
  fishes: 'Fishes',
};

const CategoryCard = ({ category, image, productCount }: CategoryCardProps) => {
  return (
    <Link
      to={`/store?pet=${category}`}
      className="group relative overflow-hidden rounded-2xl aspect-square card-hover"
    >
      <img
        src={image}
        alt={categoryLabels[category]}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-soft-brown/90 via-soft-brown/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-end p-6 text-center">
        <h3 className="text-2xl md:text-3xl font-display font-bold text-cream mb-1">
          {categoryLabels[category]}
        </h3>
        <p className="text-cream/80 text-sm">
          {productCount} Products
        </p>
      </div>
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary/50 rounded-2xl transition-colors" />
    </Link>
  );
};

export default CategoryCard;
