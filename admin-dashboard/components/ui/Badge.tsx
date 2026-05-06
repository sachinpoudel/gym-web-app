import clsx from "clsx";

type BadgeProps = {
  label: string;
  variant?: "solid" | "outline" | "muted";
};

export default function Badge({ label, variant = "solid" }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variant === "solid" && "bg-black text-white",
        variant === "outline" && "border border-black text-black",
        variant === "muted" && "bg-neutral-200 text-black"
      )}
    >
      {label}
    </span>
  );
}
