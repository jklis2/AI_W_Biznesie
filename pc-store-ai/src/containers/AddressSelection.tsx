import { useState } from 'react';
import CheckoutCard from '@/components/ui/CheckoutCard';
import NewAddressForm from './NewAddressForm';

interface Address {
  _id: string;
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

interface NewAddress {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function AddressSelection({
  addresses,
  selectedAddress,
  setSelectedAddress,
  addNewAddress,
}: {
  addresses: Address[];
  selectedAddress: string;
  setSelectedAddress: (id: string) => void;
  addNewAddress: (newAddress: NewAddress) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAddress = async (addressId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      setIsDeleting(true);
      const response = await fetch('/api/auth/address', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addressId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete address');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CheckoutCard title="Shipping Address">
      {addresses.map(address => (
        <div
          key={address._id}
          className={`border p-3 rounded-md cursor-pointer mb-2 relative ${selectedAddress === address._id ? 'border-blue-500' : ''}`}
          onClick={() => setSelectedAddress(address._id)}>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{`${address.street} ${address.houseNumber}`}</p>
              <p>{`${address.postalCode}, ${address.city}, ${address.country}`}</p>
            </div>
            <button onClick={e => handleDeleteAddress(address._id, e)} className="text-gray-500 hover:text-red-600 transition-colors p-1" disabled={isDeleting}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <button className="text-blue-600 mt-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Add New Address'}
      </button>

      {showForm && <NewAddressForm addNewAddress={addNewAddress} setShowForm={setShowForm} />}
    </CheckoutCard>
  );
}
