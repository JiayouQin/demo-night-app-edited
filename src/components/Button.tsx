import { cn } from "~/lib/utils";

import LoadingDots from "./loading/LoadingDots";

export default function Button({
  children,
  onClick,
  pending = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  pending?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "z-30 flex h-14 w-full items-center justify-center gap-2 space-x-2 rounded-xl bg-orange-500/80 px-4 py-2 font-kallisto text-xl font-bold tracking-wide text-white shadow-lg backdrop-blur transition-all focus:outline-none active:scale-95 active:shadow-md",
        pending ? "cursor-not-allowed" : "hover:bg-orange-600/80",
        className,
      )}
      disabled={pending}
      onClick={onClick}
    >
      {pending ? <LoadingDots color="#fff" /> : children}
    </button>
  );
}