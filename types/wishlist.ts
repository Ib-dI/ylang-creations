export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  weight: number;
  image: string;
  customizable?: boolean;
  addedAt: Date;
}
