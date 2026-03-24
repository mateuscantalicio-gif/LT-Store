export interface Product {
  id: number;
  category: 'Vestidos' | 'Alfaiataria' | 'Acessórios';
  title: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: 'P' | 'M' | 'G';
}

export type Page = 'home' | 'store' | 'lookbook' | 'about' | 'checkout';
