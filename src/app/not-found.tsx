import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-semibold text-primary">404</p>
      <h1 className="mt-3 text-lg font-semibold text-foreground">
        Página não encontrada
      </h1>
      <p className="mt-1 text-sm text-muted">
        O conteúdo que você procura não existe ou foi movido.
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>Voltar ao dashboard</Button>
      </Link>
    </div>
  );
}
