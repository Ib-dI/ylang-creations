export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  customizable?: boolean;
  addedAt: Date;
}
