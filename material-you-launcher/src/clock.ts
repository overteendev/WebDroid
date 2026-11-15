const shortDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const longDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function timeText(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function updateClocks(now: Date = new Date()): void {
  const time = timeText(now);
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((node) => {
    node.textContent = time;
  });

  const short = shortDate.format(now);
  document.querySelectorAll<HTMLElement>('[data-date="short"]').forEach((node) => {
    node.textContent = short;
  });

  const long = longDate.format(now);
  document.querySelectorAll<HTMLElement>('[data-date="long"]').forEach((node) => {
    node.textContent = long;
  });
}

export function startClock(): void {
  updateClocks();
  window.setInterval(updateClocks, 1000);
}
