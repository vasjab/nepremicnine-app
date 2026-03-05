import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Oops! Page not found</h2>
        <p className="text-muted-foreground mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-accent-foreground font-medium hover:bg-accent/90"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
