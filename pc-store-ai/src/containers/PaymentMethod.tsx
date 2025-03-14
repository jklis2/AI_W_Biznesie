import CheckoutCard from '@/components/ui/CheckoutCard';

export default function PaymentMethod({ selectedPayment, setSelectedPayment }: { selectedPayment: string; setSelectedPayment: (method: string) => void }) {
  return (
    <CheckoutCard title="Payment Method">
      <div className="space-y-3">
        {[
          { id: 'card', label: 'Credit/Debit Card' },
          { id: 'paypal', label: 'PayPal' },
          { id: 'applepay', label: 'Apple Pay' },
        ].map(option => (
          <label key={option.id} className="flex items-center space-x-2">
            <input type="radio" name="payment" className="w-4 h-4" checked={selectedPayment === option.id} onChange={() => setSelectedPayment(option.id)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </CheckoutCard>
  );
}
