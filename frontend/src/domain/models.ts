export interface IServiceCategory {
  id: string;
  title: string;
  description: string;
  is_active: boolean;
}

export interface IService {
  id: string;
  category_id: string;
  title: string;
  description: string;
  long_description: string;
  price_model: string;
  price: number;
  features?: string[]; 
  icon: string;
  whatsapp_number?: string;
  trust_text?: string;
  contact_options?: string; // JSON string
  is_active: boolean;
  category?: IServiceCategory;
}

export interface IServiceFilters {
  search?: string;
  categoryId?: string;
  maxPrice?: number;
}
