export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  configuration: {
    fabricName: string;
    fabricColor: string;
    embroidery?: string;
    embroideryColor?: string;
    size?: string;
    selectedColor?: string;    // hex, pour le swatch
    selectedColorName?: string; // nom affiché
  };
  price: number;
  weight: number; // Weight in grams
  quantity: number;
  thumbnail?: string;
}

export interface CheckoutFormData {
  // Step 1: Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Step 2: Adresse de livraison
  address: string;
  addressComplement?: string;
  city: string;
  postalCode: string;
  country: string;

  // Step 3: Notes
  deliveryNotes?: string;
}
