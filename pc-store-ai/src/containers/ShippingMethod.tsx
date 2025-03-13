import CheckoutCard from "@/components/ui/CheckoutCard";

export type ShippingOptionId = 'standard' | 'express' | 'nextDay';

export interface ShippingOptionDetails {
  label: string;
  price: number;
  deliveryTime: string;
}

export const shippingOptions: Record<ShippingOptionId, ShippingOptionDetails> = {
  standard: { label: "Standard Shipping", price: 4.99, deliveryTime: "5-8 business days" },
  express: { label: "Express Shipping", price: 14.99, deliveryTime: "1-2 business days" },
  nextDay: { label: "Next-Day Delivery", price: 29.99, deliveryTime: "Next business day" }
};

export default function ShippingMethod({
  selectedShipping,
  setSelectedShipping,
}: {
  selectedShipping: ShippingOptionId;
  setSelectedShipping: (method: ShippingOptionId) => void;
}) {
  return (
    <CheckoutCard title="Shipping Method">
      <div className="space-y-3">
        {(Object.entries(shippingOptions) as [ShippingOptionId, ShippingOptionDetails][]).map(([id, option]) => (
          <label key={id} className="flex items-center justify-between p-3 border rounded-md cursor-pointer hover:border-blue-500">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name="shipping"
                className="w-4 h-4 text-blue-600"
                checked={selectedShipping === id}
                onChange={() => setSelectedShipping(id)}
              />
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-gray-500">{option.deliveryTime}</p>
              </div>
            </div>
            <span className="font-semibold">{option.price.toFixed(2)} PLN</span>
          </label>
        ))}
      </div>
    </CheckoutCard>
  );
}
