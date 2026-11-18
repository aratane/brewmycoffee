"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Clock, Copy, Check, Landmark, QrCode, Upload, ShieldCheck, PartyPopper, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatIDR, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { useOrderTracking } from "@/hooks/use-order-stream";

const Celebration = dynamic(() => import("@/components/three/celebration-scene"), { ssr: false });

export type PaymentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  tax: number;
  createdAt: string;
  customerName: string;
  type: string;
  items: Array<{ nameSnapshot: string; quantity: number; lineTotal: number }>;
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    qrisString: string | null;
    vaNumber: string | null;
    bank: string | null;
    proofUrl: string | null;
    expirationAt: string | null;
    metadata: unknown;
  } | null;
};

export function PaymentPanel({ order }: { order: PaymentOrder }) {
  const tracking = useOrderTracking(order.orderNumber, 5000);
  const status = tracking?.status ?? order.status;
  const payment = order.payment;
  const meta = (payment?.metadata ?? {}) as { mode?: string; reason?: string; error?: string };
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const paid = ["PAID", "CONFIRMED", "PREPARING", "READY", "COMPLETED"].includes(status);
  const failed = ["EXPIRED", "FAILED", "CANCELLED"].includes(status) && !paid;
  const msLeft = payment?.expirationAt ? new Date(payment.expirationAt).getTime() - now : 0;
  const expired = payment?.expirationAt ? msLeft <= 0 : false;

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success("Copied to clipboard!");
    window.setTimeout(() => setCopied(null), 2000);
  };

  const uploadProof = async () => {
    if (!file || !payment) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("proof", file);
      const res = await fetch(`/api/payments/${payment.id}/proof`, { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success("Proof uploaded! Our team will verify it shortly.");
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (paid) {
    return (
      <div className="container-artisan py-12 text-center">
        <div className="mx-auto h-72 w-full max-w-lg">
          <Celebration />
        </div>
        <Badge tone="success" className="mt-4">Payment successful</Badge>
        <h1 className="heading-lg mt-4">YAY! YOUR COFFEE IS ON ITS WAY!</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">Buni is doing a happy dance. We're getting your order ready right now! 🐰☕</p>
        <div className="mx-auto mt-7 max-w-sm rounded-3xl border border-beige/50 bg-white/70 p-6 text-left shadow-soft">
          <div className="flex justify-between text-sm"><span className="text-muted">Order number</span><span className="font-bold">{order.orderNumber}</span></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Status</span><Badge tone="info">{ORDER_STATUS_LABELS[status]}</Badge></div>
          <div className="mt-2 flex justify-between text-sm"><span className="text-muted">Paid</span><span className="font-bold">{formatIDR(order.total)}</span></div>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={`/payment/success/${order.orderNumber}`}><Button>View success page <PartyPopper className="h-4 w-4" /></Button></Link>
          <Link href="/track-order"><Button variant="secondary">Track my order <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-artisan grid gap-8 py-12 lg:grid-cols-[1fr_360px]">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-beige/50 bg-white/70 p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="section-label">💳 Almost There</span>
            <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Complete your payment</h1>
            <p className="mt-1 text-sm text-muted">Order {order.orderNumber} · {order.customerName}</p>
          </div>
          <Badge tone={paid ? "success" : failed ? "danger" : "warning"}>{failed ? "Payment not completed" : "Awaiting payment"}</Badge>
        </div>

        {failed && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div><p className="font-bold">This payment was not completed.</p><p className="mt-1">You can place a fresh order with a new payment attempt.</p><Link href="/menu" className="mt-2 inline-block font-bold underline">Back to menu</Link></div>
          </div>
        )}

        {meta.mode === "unconfigured" && (
          <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">
            <div className="flex items-center gap-2 font-bold text-amber-900"><ShieldCheck className="h-5 w-5" /> QRIS gateway not configured yet</div>
            <p className="mt-2 text-sm text-amber-900/80">
              No QR code is shown because none was generated by a payment gateway — we never display fake QRIS codes.
              {meta.reason && <span className="block text-xs">Reason: {meta.reason}</span>}
            </p>
            <p className="mt-3 text-sm text-amber-900/80">To enable real QRIS: set <code className="rounded bg-white/70 px-1">PAYMENT_MODE=sandbox</code>, add <code className="rounded bg-white/70 px-1">MIDTRANS_SERVER_KEY</code> and <code className="rounded bg-white/70 px-1">MIDTRANS_CLIENT_KEY</code> to your <code className="rounded bg-white/70 px-1">.env</code>, then restart the app. Your order #{order.orderNumber} is saved.</p>
          </div>
        )}

        {payment?.qrisString && payment.status === "PENDING" && !expired && (
          <div className="mt-7 flex flex-col items-center">
            <div className="rounded-3xl border border-beige/60 bg-white p-5 shadow-soft">
              <QRCodeSVG value={payment.qrisString} size={230} level="M" marginSize={0} />
            </div>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold"><QrCode className="h-4 w-4 text-caramel" /> Scan with any QRIS-enabled app</p>
            <p className="mt-1 text-xs text-muted">GoPay · OVO · DANA · ShopeePay · Mobile Banking</p>
            <button onClick={() => copy(payment.qrisString!, "qris")} className="mt-3 flex items-center gap-2 text-xs font-bold text-mocha underline">
              {copied === "qris" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied === "qris" ? "Copied!" : "Copy QRIS string"}
            </button>
            {payment.expirationAt && (
              <div className="mt-4 flex items-center gap-2 rounded-full bg-cream/70 px-4 py-2 text-xs font-bold text-mocha">
                <Clock className="h-4 w-4" /> Expires in {String(Math.floor(Math.max(0, msLeft) / 60000)).padStart(2, "0")}:{String(Math.floor((Math.max(0, msLeft) % 60000) / 1000)).padStart(2, "0")}
              </div>
            )}
          </div>
        )}

        {payment?.vaNumber && payment.status === "PENDING" && (
          <div className="mt-7 rounded-2xl bg-cream/60 p-5">
            <p className="flex items-center gap-2 text-sm font-bold"><Landmark className="h-4 w-4 text-caramel" /> {payment.bank ?? "Bank"} Virtual Account</p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-4 py-3">
              <span className="font-display text-xl font-semibold tracking-wider">{payment.vaNumber}</span>
              <button onClick={() => copy(payment.vaNumber!, "va")} className="text-mocha hover:text-caramel">{copied === "va" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
            </div>
            {payment.expirationAt && <p className="mt-3 text-xs text-muted">Pay before {formatDateTime(payment.expirationAt)}</p>}
          </div>
        )}

        {payment?.method === "BANK_TRANSFER" && meta.mode === "manual" && payment.status === "PENDING" && (
          <div className="mt-7 space-y-4">
            <div className="rounded-2xl bg-cream/60 p-5">
              <p className="flex items-center gap-2 text-sm font-bold"><Landmark className="h-4 w-4 text-caramel" /> Static bank transfer</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Bank</span><span className="font-bold">{(payment.bank ?? "BCA").toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-muted">Account number</span><div className="flex items-center gap-2"><span className="font-bold tracking-wide">{payment.vaNumber}</span><button onClick={() => copy(payment.vaNumber!, "acc")} className="text-mocha">{copied === "acc" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div></div>
                <div className="flex justify-between"><span className="text-muted">Account name</span><span className="font-bold">ARTISAN BREW CO.</span></div>
                <div className="flex justify-between border-t border-beige/40 pt-2"><span className="text-muted">Exact amount</span><span className="font-display text-lg font-bold text-mocha">{formatIDR(payment.amount)}</span></div>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-caramel/40 bg-warm p-5">
              <p className="text-sm font-bold">Upload your transfer proof</p>
              <p className="mt-1 text-xs text-muted">Manual transfers are verified by our team — we never mark them paid automatically.</p>
              {payment.proofUrl && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-cream/60 p-2">
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg"><Image src={payment.proofUrl} alt="Payment proof" fill sizes="56px" className="object-cover" /></div>
                  <span className="text-xs font-semibold text-emerald-700">Proof received · awaiting verification</span>
                </div>
              )}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="h-auto py-2" />
                <Button onClick={uploadProof} disabled={!file || uploading} className="shrink-0"><Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload proof"}</Button>
              </div>
            </div>
          </div>
        )}

        {payment?.method === "CASH" && (
          <div className="mt-7 rounded-2xl bg-cream/60 p-5 text-sm text-muted">
            <p className="font-bold text-ink">Pay at the counter</p>
            <p className="mt-1">Show order number <span className="font-bold text-mocha">{order.orderNumber}</span> to our cashier. Your barista will start brewing once payment is confirmed.</p>
          </div>
        )}

        <div className="mt-7 flex items-center gap-2 border-t border-beige/40 pt-5 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Payments are verified securely on the server. Never share your payment credentials.
        </div>
      </motion.div>

      <aside className="h-fit rounded-3xl border border-beige/50 bg-cream/40 p-6 shadow-soft lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-semibold">Your order</h2>
        <div className="mt-4 space-y-2">
          {order.items.map((i, idx) => (
            <div key={idx} className="flex justify-between text-sm"><span className="text-muted">{i.quantity}× {i.nameSnapshot}</span><span className="font-semibold">{formatIDR(i.lineTotal)}</span></div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-beige/50 pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatIDR(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatIDR(order.tax)}</span></div>
          <div className="flex justify-between font-display text-lg font-semibold"><span>Total</span><span className="text-mocha">{formatIDR(order.total)}</span></div>
        </div>
        <Link href="/track-order" className="mt-5 block"><Button variant="secondary" className="w-full"><RefreshCw className="h-4 w-4" /> Track order</Button></Link>
        <p className="mt-3 text-center text-[11px] text-muted">Placed {formatDateTime(order.createdAt)}</p>
      </aside>
    </div>
  );
}
