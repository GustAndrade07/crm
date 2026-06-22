import { Spinner } from "@/components/ui/primitives";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}
