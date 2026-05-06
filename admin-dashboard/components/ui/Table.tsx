import type { HTMLAttributes } from "react";
import clsx from "clsx";

type TableProps = HTMLAttributes<HTMLTableElement>;

type WrapperProps = HTMLAttributes<HTMLDivElement>;

export function TableWrapper({ className, ...props }: WrapperProps) {
  return (
    <div
      className={clsx(
        "w-full overflow-x-auto rounded-lg border border-black/10 bg-white",
        className
      )}
      {...props}
    />
  );
}

export function Table({ className, ...props }: TableProps) {
  return (
    <table
      className={clsx(
        "w-full border-separate border-spacing-0 text-sm",
        className
      )}
      {...props}
    />
  );
}
