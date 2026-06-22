"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <AlertTriangle className="size-10 text-danger" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        Algo deu errado
      </h2>
      <p className="mt-1 max-w-sm text-sm text-muted">
        Não foi possível carregar esta página. Tente novamente.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
