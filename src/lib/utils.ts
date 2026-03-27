import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sortByDateAsc<T>(items: T[], getDate: (item: T) => Date) {
  return [...items].sort((left, right) => getDate(left).getTime() - getDate(right).getTime());
}

export function absoluteDifference(left: number | null, right: number | null) {
  if (left === null || right === null) {
    return null;
  }

  return Math.abs(left - right);
}

