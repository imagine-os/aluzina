/**
 * Clipboard and download helpers shared by the whole app (P-07: one implementation, not one per module).
 * `navigator.clipboard` is absent on insecure origins and in some embedded webviews, so the caller always
 * gets a boolean instead of an unhandled rejection. Used by D-09 / D-14 (qa), G-08 (brand) and P-05 (public).
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Saves an already-served file (a PDF, an image) under `name` without a visible link: the actions bus and voice call this, not a click. */
export function downloadUrl(href: string, name: string): string {
  const a = document.createElement('a');
  a.href = href;
  a.download = name;
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return name;
}

/** Downloads `text` as a file (the JSON export on D-09, the CSV on S-11). */
export function downloadText(name: string, text: string, type = 'application/json'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  downloadUrl(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
