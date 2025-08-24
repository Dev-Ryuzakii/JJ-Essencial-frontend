import { get } from './apiClient';

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

const categoriesApi = {
  /**
   * List all categories
   * GET /categories
   */
  list: async (): Promise<Category[]> => {
    const response = await get<Category[]>('/categories');
    return response.data;
  }
};

export default categoriesApi;
