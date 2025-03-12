interface CheckoutCardProps {
  title: string;
  children: React.ReactNode;
}

export default function CheckoutCard({ title, children }: CheckoutCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
