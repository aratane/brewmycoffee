import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";

export default function ContactPage() {
  return (
    <div className="blob-bg">
      <div className="container-artisan py-12">
        <div className="mb-10 text-center">
          <span className="section-label">💌 Say Hello</span>
          <h1 className="heading-xl mt-3">We'd love to hear from you!</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">Questions, feedback, or just want to say hi? Drop us a note and our little team will get back to you.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ContactForm />
          <aside className="space-y-4">
            {[
              { icon: MapPin, title: "Visit us", text: "Jl. Kopi Sensor No. 12, Jakarta Selatan" },
              { icon: Phone, title: "Call us", text: "+62 812-3456-7890" },
              { icon: Mail, title: "Email us", text: "hello@artisanbrew.co" },
              { icon: Clock, title: "Opening hours", text: "Mon–Sun · 07.00–22.00" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-beige/50 bg-white/70 p-4 shadow-soft">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-caramel"><Icon className="h-4 w-4" /></span>
                <div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-xs text-muted">{text}</p></div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
