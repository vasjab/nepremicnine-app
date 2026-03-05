import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 mb-8">
          <span className="text-4xl font-black text-accent">404</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Page not found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The page you are looking for doesn&apos;t exist or has been moved.
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
