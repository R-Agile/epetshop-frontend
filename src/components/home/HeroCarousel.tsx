import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: 'Everything Your Pet Needs',
    subtitle: 'Premium quality products for your furry friends',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=600&fit=crop',
    cta: 'Shop Now',
    link: '/store',
  },
  {
    id: 2,
    title: 'New Cat Collection',
    subtitle: 'Discover our latest toys and accessories',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1600&h=600&fit=crop',
    cta: 'Explore',
    link: '/store?pet=cats',
  },
  {
    id: 3,
    title: 'Up to 30% Off Dog Food',
    subtitle: 'Organic and healthy nutrition for your dogs',
    image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=1600&h=600&fit=crop',
    cta: 'Shop Sale',
    link: '/store?pet=dogs&category=food',
  },
];

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-medium">
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative min-w-full h-full"
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-soft-brown/80 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8 md:px-16">
                <div className="max-w-lg animate-fade-in">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-cream mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-cream/90 text-lg md:text-xl mb-6">
                    {slide.subtitle}
                  </p>
                  <Link to={slide.link}>
                    <Button variant="hero" size="lg">
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors shadow-soft"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors shadow-soft"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-primary w-8'
                : 'bg-cream/50 hover:bg-cream/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
