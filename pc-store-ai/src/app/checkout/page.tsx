'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContactInfo from '@/containers/ContactInfo';
import AddressSelection from '@/containers/AddressSelection';
import ShippingMethod from '@/containers/ShippingMethod';
import PaymentMethod from '@/containers/PaymentMethod';
import OrderSummary from '@/containers/OrderSummary';
import { ShippingOptionId } from '@/containers/ShippingMethod';

interface NewAddress {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

interface Address extends NewAddress {
  _id: string;
}

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
}

interface UserData {
  email: string;
  addresses: Address[];
}

export default function Checkout() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<ShippingOptionId>("standard");
  const [selectedPayment, setSelectedPayment] = useState<string>("card");
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/auth/login?redirect=/checkout');
            return;
          }
          throw new Error('Failed to authenticate user');
        }
        
        const { user } = await userResponse.json() as { user: UserData };
        if (!user) {
          throw new Error('User data not found');
        }
        
        setEmail(user.email);
        setAddresses(user.addresses || []);
        if (user.addresses?.length > 0) {
          setSelectedAddress(user.addresses[0]._id);
        }

        const cartResponse = await fetch("/api/cart");
        if (!cartResponse.ok) {
          throw new Error('Failed to fetch cart');
        }
        const cartData = await cartResponse.json() as Cart;
        setCart(cartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleAddNewAddress = async (newAddress: NewAddress) => {
    try {
      setError(null);
      const response = await fetch("/api/auth/address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add new address');
      }
      
      const { success, data } = await response.json();
      if (!success || !data) {
        throw new Error('Failed to add new address');
      }
      
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data._id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add new address');
      console.error("Error adding new address:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-pulse">Loading checkout information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="text-red-600">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <ContactInfo email={email} />
        <AddressSelection 
          addresses={addresses} 
          selectedAddress={selectedAddress} 
          setSelectedAddress={setSelectedAddress} 
          addNewAddress={handleAddNewAddress}
        />
        <ShippingMethod 
          selectedShipping={selectedShipping} 
          setSelectedShipping={setSelectedShipping} 
        />
        <PaymentMethod 
          selectedPayment={selectedPayment} 
          setSelectedPayment={setSelectedPayment} 
        />
      </div>
      <div className="lg:sticky lg:top-6">
        <OrderSummary 
          cart={cart?.items || []}
          selectedShipping={selectedShipping}
        />
      </div>
    </div>
  );
}