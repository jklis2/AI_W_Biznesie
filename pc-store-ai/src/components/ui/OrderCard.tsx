import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderCardProps {
  _id: string;
  status: 'PENDING' | 'PAID' | 'FAILED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string | Date;
  shippingMethod: string;
}

export default function OrderCard({ _id, status, totalAmount, items, createdAt, shippingMethod }: OrderCardProps) {
  // Format the date
  const orderDate = new Date(createdAt);
  const formattedDate = format(orderDate, 'dd MMM yyyy, HH:mm');
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-4">
      {/* Order header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{_id.substring(0, 8)}...</span></p>
          <p className="text-sm text-gray-500">Placed on: <span className="font-medium text-gray-700">{formattedDate}</span></p>
        </div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>
      
      {/* Order items */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Items</h3>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
              </div>
              <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Order summary */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <p className="text-gray-600">Shipping Method:</p>
          <p className="font-medium">{shippingMethod}</p>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Total Amount:</p>
          <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}