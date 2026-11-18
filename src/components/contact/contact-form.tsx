"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { contactSchema } from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/misc";

export function ContactForm() {
  const [sending, setSending] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof contactSchema>>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send message");
      toast.success("Message sent! We'll get back to you soon. 💕");
      reset();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setSending(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-3xl border border-beige/50 bg-white/70 p-7 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label className="mb-1.5 block">Your name</Label><Input {...register("name")} placeholder="Cindy Coffee" />{errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}</div>
        <div><Label className="mb-1.5 block">Email</Label><Input {...register("email")} type="email" placeholder="you@example.com" />{errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}</div>
      </div>
      <div><Label className="mb-1.5 block">Subject</Label><Input {...register("subject")} placeholder="A quick question..." />{errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}</div>
      <div><Label className="mb-1.5 block">Message</Label><Textarea {...register("message")} placeholder="Tell us what's on your mind..." className="min-h-[150px]" />{errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}</div>
      <Button type="submit" disabled={sending}><Send className="h-4 w-4" /> {sending ? "Sending..." : "Send message"}</Button>
    </form>
  );
}
