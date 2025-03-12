import CheckoutCard from "@/components/ui/CheckoutCard";

export default function ContactInfo({ email }: { email: string }) {
  return (
    <CheckoutCard title="Contact Information">
      <input
        type="email"
        value={email}
        readOnly
        className="w-full p-3 border border-gray-300 rounded-md bg-gray-100"
      />
    </CheckoutCard>
  );
}
