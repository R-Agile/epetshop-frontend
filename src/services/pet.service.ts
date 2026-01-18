import api from '@/lib/api';

export interface PetProfile {
  _id: string;
  user_id: string;
  pet_name: string;
  breed: string;
  age: string;
  pet_type: string;
  image_url?: string;
  notes?: string;
  username?: string;
}

export interface PetProfileCreate {
  user_id: string;
  pet_name: string;
  breed: string;
  age: string;
  pet_type: string;
  image_url?: string;
  notes?: string;
}

export const petService = {
  async getUserPets(userId: string): Promise<PetProfile[]> {
    try {
      const response = await api.get(`/pet-profiles/user/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading pets:', error);
      return [];
    }
  },

  async addPet(data: PetProfileCreate): Promise<PetProfile> {
    const response = await api.post('/pet-profiles/', data);
    return response.data;
  },

  async updatePet(petId: string, data: Partial<PetProfileCreate>): Promise<PetProfile> {
    const response = await api.put(`/pet-profiles/${petId}`, data);
    return response.data;
  },

  async deletePet(petId: string): Promise<void> {
    await api.delete(`/pet-profiles/${petId}`);
  },
};
