import CheckoutCard from "@/components/ui/CheckoutCard";
import Image from "next/image";
import { shippingOptions, ShippingOptionId } from "./ShippingMethod";

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
  const subtotal = cart.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
  const shipping = shippingOptions[selectedShipping].price;
  const total = subtotal + shipping;

  if (!cart?.length) {
    return (
      <CheckoutCard title="Order Summary">
        <div className="text-center py-4 text-gray-500">
          Your cart is empty
        </div>
      </CheckoutCard>
    );
  }

  return (
    <CheckoutCard title="Order Summary">
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.productId._id} className="flex items-center space-x-4 border-b pb-4">
            <div className="relative w-16 h-16">
              <Image 
                src={item.productId.images[0]} 
                alt={item.productId.name} 
                fill 
                className="object-cover rounded-md"
              />
            </div>
            <div className="flex-grow">
              <p className="font-semibold">{item.productId.name}</p>
              <p className="text-gray-600">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold">{(item.productId.price * item.quantity).toFixed(2)} PLN</p>
          </div>
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
