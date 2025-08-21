import { get, post } from './apiClient'

export interface Address {
  id: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface AddAddressData {
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const addressesApi = {
  /**
   * List user addresses
   * GET /users/addresses
   */
  list: async (): Promise<Address[]> => {
    const response = await get<{ data: Address[] }>('/users/addresses');
    return response.data.data;
  },

  /**
   * Add a new address
   * POST /users/addresses
   */
  add: async (data: AddAddressData): Promise<Address> => {
    const response = await post<{ data: Address }>('/users/addresses', data);
    return response.data.data;
  }
}

export default addressesApi
