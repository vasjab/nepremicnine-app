import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md animate-fade-in">
        <span className="text-6xl mb-6 block">🏚️</span>
        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Page not found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          This place doesn&apos;t exist — looks like it moved out! Let&apos;s get you back home.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.97] transition-all duration-200 shadow-sm"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
