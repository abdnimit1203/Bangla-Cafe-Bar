import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, hint, error, optional, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="ml-1 font-normal text-ink-faint">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const control =
  "w-full rounded-xl bg-surface px-4 py-3 text-sm text-ink shadow-inset placeholder:text-ink-faint focus:outline-2 focus:outline-gold/60 disabled:opacity-60";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export function Input({ id, label, hint, error, optional, wrapperClassName, className, ...rest }: InputProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <input
        id={id}
        className={cn(control, error && "outline-2 outline-danger/60", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export function Textarea({ id, label, hint, error, optional, wrapperClassName, className, ...rest }: TextareaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <textarea
        id={id}
        className={cn(control, "min-h-24 resize-y", error && "outline-2 outline-danger/60", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export function Select({ id, label, hint, error, optional, wrapperClassName, className, children, ...rest }: SelectProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} optional={optional} className={wrapperClassName}>
      <div className="relative">
        <select
          id={id}
          className={cn(control, "appearance-none pr-10", error && "outline-2 outline-danger/60", className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...rest}
        >
          {children}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint" />
      </div>
    </FieldShell>
  );
}
