import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Leaf, Coffee, Sparkles, Users, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "About Us", description: "The story behind Artisan Brew Co." };

export default function AboutPage() {
  return (
    <div className="blob-bg">
      <div className="container-artisan py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-label"><Heart className="h-3.5 w-3.5" /> Our Story</span>
          <h1 className="heading-xl mt-3">Coffee, kindness, and a <span className="text-gradient">little bunny magic.</span></h1>
          <p className="mt-5 text-lg text-muted">It all began with a very simple idea: the best coffee tastes even better when it makes you smile.</p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-cream via-[#F4E3CE] to-beige p-10 shadow-soft">
            <span className="text-[120px] leading-none">🐰☕</span>
            <p className="mt-4 font-display text-xl font-semibold">"A cup should feel like a hug."</p>
            <p className="mt-2 text-sm text-muted">— Buni, our head barista (and happiness officer)</p>
          </div>
          <div className="space-y-5 text-muted">
            <p className="leading-relaxed">Artisan Brew Co. opened its doors in 2018 as a tiny corner café with one espresso machine, a handful of cups, and a bunny-shaped cookie jar. Word spread quickly — not just because of the coffee, but because of how it felt to be here.</p>
            <p className="leading-relaxed">Today we still roast in small batches, source ethically, and treat every customer like a regular. Our bunny mascot is a reminder that great coffee doesn't have to be serious to be excellent.</p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: Leaf, title: "Ethically sourced", text: "Beans from farms we know by name." },
                { icon: Coffee, title: "Small-batch roasted", text: "Freshness you can taste in every sip." },
                { icon: Users, title: "Community first", text: "A cozy space for everyone." },
                { icon: Sparkles, title: "Made with love", text: "A little magic in every cup." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-beige/50 bg-white/70 p-4">
                  <Icon className="h-5 w-5 text-caramel" />
                  <p className="mt-2 text-sm font-bold text-ink">{title}</p>
                  <p className="mt-1 text-xs">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-20 rounded-[2.5rem] bg-mocha p-10 text-center text-cream sm:p-14">
          <Award className="mx-auto h-9 w-9 text-pink" />
          <h2 className="mt-4 font-display text-3xl font-semibold">Our coffee philosophy</h2>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-cream/75">Great coffee is simple: good beans, careful craft, and respect for the people who grow it. We source single-origin beans, roast them in small batches, and brew each cup to order. No shortcuts, no compromise — just a better cup and a happier day.</p>
          <Link href="/menu" className="mt-7 inline-flex"><Button variant="pink">Find your happy cup <ArrowRight className="h-4 w-4" /></Button></Link>
        </section>
      </div>
    </div>
  );
}
