import { useState } from 'react';

interface NewAddress {
  street: string;
  houseNumber: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function NewAddressForm({ addNewAddress, setShowForm }: { addNewAddress: (newAddress: NewAddress) => Promise<void>; setShowForm: (state: boolean) => void }) {
  const [formData, setFormData] = useState<NewAddress>({
    street: '',
    houseNumber: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewAddress(formData);
    setShowForm(false);
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-md shadow-sm border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Address</h3>
          <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <input type="text" name="street" placeholder="Street" required value={formData.street} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
          <input
            type="text"
            name="houseNumber"
            placeholder="House Number"
            required
            value={formData.houseNumber}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <input type="text" name="city" placeholder="City" required value={formData.city} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="text" name="postalCode" placeholder="Postal Code" required value={formData.postalCode} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
          <input type="text" name="country" placeholder="Country" required value={formData.country} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div className="flex space-x-3">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
}
