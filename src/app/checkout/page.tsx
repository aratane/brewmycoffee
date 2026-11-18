import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="blob-bg min-h-screen">
      <div className="container-artisan pb-8 pt-12 text-center">
        <span className="section-label">🎉 One More Step</span>
        <h1 className="heading-xl mt-3">Almost There, Coffee Lover!</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted">Just a few details and your happy cup will be on its way.</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
