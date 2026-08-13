import { Link, useLocation } from 'react-router';

export default function PaymentResult() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const resultCode = Number(params.get('resultCode') ?? -1);
  const orderId = params.get('orderId') ?? '';
  const momoMessage = params.get('message') ?? '';
  const succeeded = resultCode === 0;

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-lg w-full mx-auto px-8">
        <div className="rounded-3xl border border-[#e4f3fc] bg-white p-10 text-center shadow-xl">
          <div className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full text-3xl font-bold ${
            succeeded ? 'bg-[#f0fdf4] text-[#15803d]' : 'bg-[#fef2f2] text-[#b91c1c]'
          }`}>
            {succeeded ? '✓' : '!'}
          </div>
          <h1 className="text-3xl font-bold text-[#102a56]">
            {succeeded ? 'Payment Submitted' : 'Payment Unsuccessful'}
          </h1>
          <p className="mt-3 text-[#5a7899]">
            {succeeded
              ? 'MoMo accepted the payment. Your order will update after payment confirmation.'
              : momoMessage || 'MoMo could not complete the payment.'}
          </p>
          {orderId && (
            <p className="mt-4 rounded-xl bg-[#f3faff] px-4 py-3 text-sm font-semibold text-[#486f95]">
              Order: {orderId}
            </p>
          )}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {succeeded ? (
              <Link to="/orders" className="rounded-xl bg-[#315fae] px-5 py-3 font-bold text-white hover:bg-[#244f92]">
                View Orders
              </Link>
            ) : (
              <Link to="/cart" className="rounded-xl border border-[#c9deef] px-5 py-3 font-bold text-[#102a56] hover:border-[#6ecdf0]">
                View Cart
              </Link>
            )}
            <Link to="/browse" className="rounded-xl bg-[#315fae] px-5 py-3 font-bold text-white hover:bg-[#244f92]">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
