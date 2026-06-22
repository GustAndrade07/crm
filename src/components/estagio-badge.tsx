import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  ESTAGIO_LABEL,
  ESTAGIO_STYLE,
  isEstagio,
} from "@/lib/constants";

export function EstagioBadge({ estagio }: { estagio: string }) {
  if (!isEstagio(estagio)) return <Badge>{estagio}</Badge>;
  const style = ESTAGIO_STYLE[estagio];
  return (
    <Badge className={style.badge}>
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {ESTAGIO_LABEL[estagio]}
    </Badge>
  );
}
