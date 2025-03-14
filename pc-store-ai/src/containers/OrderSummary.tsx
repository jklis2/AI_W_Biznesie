import { useState } from 'react';
import CheckoutCard from '@/components/ui/CheckoutCard';
import Image from 'next/image';
import { shippingOptions, ShippingOptionId } from './ShippingMethod';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface OrderSummaryProps {
  cart: CartItem[];
  selectedShipping: ShippingOptionId;
}

export default function OrderSummary({ cart, selectedShipping }: OrderSummaryProps) {
  const subtotal = cart.reduce((acc, item) => acc + (item.productId ? item.productId.price * item.quantity : 0), 0);
  const shipping = shippingOptions[selectedShipping].price;
  const total = subtotal + shipping;

  if (!cart?.length) {
    return (
      <CheckoutCard title="Order Summary">
        <div className="text-center py-4 text-gray-500">Your cart is empty</div>
      </CheckoutCard>
    );
  }

  return (
    <CheckoutCard title="Order Summary">
      <div className="space-y-4">
        {cart.map(item => (
          <CartItemRow key={item.productId?._id} item={item} />
        ))}

        <div className="space-y-2 pt-4">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold">{subtotal.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping ({shippingOptions[selectedShipping].label}):</span>
            <span className="font-semibold">{shipping.toFixed(2)} PLN</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span className="text-green-600">{total.toFixed(2)} PLN</span>
          </div>
        </div>
      </div>
    </CheckoutCard>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center space-x-4 border-b pb-4">
      <div className="relative w-16 h-16">
        {!imageError && item.productId?.images?.[0] ? (
          <Image src={item.productId.images[0]} alt={item.productId?.name || 'Product image'} fill className="object-cover rounded-md" onError={() => setImageError(true)} />
        ) : (
          <NoImagePlaceholder />
        )}
      </div>
      <div className="flex-grow">
        <p className="font-semibold">{item.productId?.name}</p>
        <p className="text-gray-600">Qty: {item.quantity}</p>
      </div>
      <p className="font-semibold">{(item.productId?.price * item.quantity).toFixed(2)} PLN</p>
    </div>
  );
}

function NoImagePlaceholder() {
  return (
    <div className="text-gray-500 text-center flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2z"
        />
      </svg>
      <span className="text-xs">No photo</span>
    </div>
  );
}
