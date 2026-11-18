import { OrderTracker } from "@/components/orders/order-tracker";

export default function TrackOrderPage() {
  return (
    <div className="blob-bg min-h-screen">
      <div className="container-artisan py-12">
        <div className="mb-10 text-center">
          <span className="section-label">🐰 Live Updates</span>
          <h1 className="heading-xl mt-3">Your Bunny Barista Is On It!</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">Enter your order number to follow your coffee from the first pour to the final happy sip.</p>
        </div>
        <OrderTracker />
      </div>
    </div>
  );
}
