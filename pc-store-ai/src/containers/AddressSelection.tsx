import { useState } from "react";
import CheckoutCard from "@/components/ui/CheckoutCard";
import NewAddressForm from "./NewAddressForm";

interface Address {
  _id: string;
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
  addNewAddress: (newAddress: Address) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <CheckoutCard title="Shipping Address">
      {addresses.map((address) => (
        <div
          key={address._id}
          className={`border p-3 rounded-md cursor-pointer ${selectedAddress === address._id ? "border-blue-500" : ""}`}
          onClick={() => setSelectedAddress(address._id)}
        >
          <p className="font-semibold">{`${address.street} ${address.houseNumber}`}</p>
          <p>{`${address.postalCode}, ${address.city}, ${address.country}`}</p>
        </div>
      ))}
      <button className="text-blue-600 mt-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "Add New Address"}
      </button>

      {showForm && <NewAddressForm addNewAddress={addNewAddress} setShowForm={setShowForm} />}
    </CheckoutCard>
  );
}
