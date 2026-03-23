export default function PaymentCard({ payment }) {
  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{payment.month}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
          {payment.status.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-sm font-medium text-gray-900">₹{payment.amount}</span>
        </div>
        {payment.payment_mode && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Payment Mode</span>
            <span className="text-sm font-medium text-gray-900">{payment.payment_mode}</span>
          </div>
        )}
        {payment.payment_date && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Payment Date</span>
            <span className="text-sm font-medium text-gray-900">
              {new Date(payment.payment_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
