import type { HTMLAttributes } from "react";
import clsx from "clsx";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border border-black/10 bg-white p-5 shadow-soft",
        className
      )}
      {...props}
    />
  );
}
