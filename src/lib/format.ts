const shortDate = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const shortDateTime = new Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatShortDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return shortDate.format(date);
}

export function formatShortDateTime(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return shortDateTime.format(date);
}

export function formatMargin(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `${value} pts`;
}

export function formatStatusLabel(locked: boolean, stale: boolean) {
  if (stale) {
    return "Read only";
  }

  return locked ? "Tips locked" : "Tips open";
}

export function joinNames(names: string[]) {
  if (names.length <= 1) {
    return names[0] ?? "Unknown";
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

