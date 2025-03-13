export interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

export interface PaymentRequestBody {
  items: CartItem[];
  totalAmount: number;
  shippingMethod: 'standard' | 'express';
  addressId: string;
}
