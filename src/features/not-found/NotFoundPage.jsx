import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center bg-surface">
      <h1 className="text-4xl font-bold text-foreground">404</h1>
      <p className="mt-2 text-body">This page doesn't exist.</p>
      <Link to="/" className="mt-6">
        <Button variant="primary" className="rounded-xl">Go home</Button>
      </Link>
    </div>
  );
}
