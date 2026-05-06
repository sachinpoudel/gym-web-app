import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm text-black placeholder:text-black/40 focus:border-black focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
