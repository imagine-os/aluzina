import { SERVICES, type ServiceCode } from '../../domain';

/** `?service=` carries the service the visitor came from into the intake form; slugs are accepted too (voice / WebMCP). */
export function toServiceCode(value: string | null | undefined): ServiceCode | null {
  if (!value) return null;
  const byCode = SERVICES.find((s) => s.code === value);
  if (byCode) return byCode.code;
  const bySlug = SERVICES.find((s) => s.slug === value);
  return bySlug ? bySlug.code : null;
}

/** Router path of the intake form, optionally preselecting a service (for `navigate()`). */
export function startPath(service: string | null): string {
  const code = toServiceCode(service);
  return code ? `/start?service=${encodeURIComponent(code)}` : '/start';
}

/** Same target as an `href` for links inside the hash router. */
export function startHref(service: string | null): string {
  return `#${startPath(service)}`;
}
