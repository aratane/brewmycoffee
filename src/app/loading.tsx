export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-pink/30" />
        <span className="relative text-5xl">🐰</span>
      </div>
      <div className="text-center">
        <p className="font-display text-xl font-semibold text-mocha">Brewing Something Magical...</p>
        <p className="mt-1 text-sm text-muted">Our bunny is warming up the espresso machine.</p>
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-beige/40">
        <div className="h-full w-1/2 animate-[shimmer_1.5s_linear_infinite] rounded-full bg-caramel" />
      </div>
    </div>
  );
}
