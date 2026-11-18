"use client";

import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Receipt, type ReceiptData } from "@/components/pos/receipt";

export function TransactionReceiptDialog({ data }: { data: ReceiptData }) {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="ghost" size="icon" aria-label="View receipt"><Eye className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogTitle>Receipt · {data.transactionNumber}</DialogTitle>
        <div className="mt-4 max-h-[70vh] overflow-y-auto"><Receipt data={data} /></div>
      </DialogContent>
    </Dialog>
  );
}
