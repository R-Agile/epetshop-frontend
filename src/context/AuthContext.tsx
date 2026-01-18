import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Pet } from '@/types';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { petService } from '@/services/pet.service';

interface AuthContextType {
  user: User | null;
  pets: Pet[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addPet: (pet: Omit<Pet, 'id'>) => void;
  updatePet: (id: string, pet: Partial<Pet>) => void;
  deletePet: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount and validate session
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Validate token by making a request to /users/me
          const response = await authService.getCurrentUser();
          if (response) {
            setUser(JSON.parse(storedUser));
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          // Token might be expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Load pets when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserPets();
    }
  }, [user?.id]);

  const loadUserPets = async () => {
    if (!user?.id) return;
    try {
      const petProfiles = await petService.getUserPets(user.id);
      const formattedPets: Pet[] = petProfiles.map(p => ({
        id: p._id,
        name: p.pet_name,
        category: p.pet_type as any,
        breed: p.breed,
        age: p.age,
        image: p.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + p.pet_name,
        notes: p.notes,
        username: p.username,
      }));
      setPets(formattedPets);
    } catch (error) {
      console.error('Failed to load pets:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      // Ensure any previous admin session does not override user requests
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      const userData: User = {
        id: response.user._id,
        name: response.user.full_name,
        email: response.user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Welcome back!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.signup({
        username: email.split('@')[0],
        email,
        full_name: name,
        password,
        role: 'user',
      });
      // Ensure any previous admin session does not override user requests
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      const userData: User = {
        id: response.user._id,
        name: response.user.full_name,
        email: response.user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${response.user.email}`,
      };
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Signup failed');
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    // Also clear any admin session data to avoid token precedence issues
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // IMPORTANT: Do NOT clear cart items - users should keep their cart after logout
    // Cart items are stored separately with guestId and will persist
    setUser(null);
    setPets([]);
    toast.info('Logged out successfully');
  };

  const addPet = async (petData: Omit<Pet, 'id'>) => {
    if (!user?.id) {
      toast.error('Please login first');
      return;
    }
    try {
      await petService.addPet({
        user_id: user.id,
        pet_name: petData.name,
        breed: petData.breed,
        age: petData.age,
        pet_type: petData.category,
        image_url: petData.image,
        notes: petData.notes,
      });
      await loadUserPets();
      toast.success(`${petData.name} added to your pets!`);
    } catch (error) {
      toast.error('Failed to add pet');
      console.error(error);
    }
  };

  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      await petService.updatePet(id, {
        pet_name: petData.name,
        breed: petData.breed,
        age: petData.age,
        pet_type: petData.category,
        image_url: petData.image,
        notes: petData.notes,
      });
      await loadUserPets();
      toast.success('Pet updated successfully');
    } catch (error) {
      toast.error('Failed to update pet');
      console.error(error);
    }
  };

  const deletePet = async (id: string) => {
    try {
      await petService.deletePet(id);
      await loadUserPets();
      toast.info('Pet removed from your profile');
    } catch (error) {
      toast.error('Failed to delete pet');
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        pets,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        addPet,
        updatePet,
        deletePet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
