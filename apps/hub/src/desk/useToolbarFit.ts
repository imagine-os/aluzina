import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * How folded the desk toolbar is (changelog 0043): 0 every control inline, 1 the secondary controls
 * (`[data-desk-fold]`) inside the More menu, 2 also the Full screen label hidden (icon + accessible name).
 */
export type ToolbarFold = 0 | 1 | 2;

/** Until the More trigger has been measured once: icon + "More" / "Más" in a small Button. */
const MORE_ESTIMATE = 96;

interface Need {
  key: string;
  /** The controls' one-row width with everything inline. */
  full: number;
  /** What the folded controls take out of that row (each with its gap). */
  folded: number;
  /** What hiding the Full screen label saves. */
  fsLabel: number;
}

/**
 * Fits the desk toolbar's controls on one row of whatever box it is in (a page column, a D-16 side-by-side column,
 * full screen): a ResizeObserver on the toolbar, not a media query. It measures the controls' natural width with
 * everything inline and picks the smallest fold that fits on one row; when even the most folded row does not fit
 * (phones), it stays unfolded and the groups stack as before. `key` names what changes the widths (language,
 * labels, which controls exist); a new key re-measures unfolded, inside the layout phase, before paint.
 */
export function useToolbarFit(key: string) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [fold, setFold] = useState<ToolbarFold>(0);
  const [tick, setTick] = useState(0);
  const need = useRef<Need | null>(null);
  const moreW = useRef(0);
  const ref = useCallback((node: HTMLDivElement | null) => setEl(node), []);

  useEffect(() => {
    if (!el) return;
    let last = -1;
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? 0);
      if (w !== last) {
        last = w;
        setTick((n) => n + 1);
      }
    });
    ro?.observe(el);
    // Web fonts change every label's width once they land.
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (!alive) return;
      need.current = null;
      setTick((n) => n + 1);
    });
    return () => {
      alive = false;
      ro?.disconnect();
    };
  }, [el]);

  useLayoutEffect(() => {
    if (!el) return;
    const cs = getComputedStyle(el);
    const gap = parseFloat(cs.columnGap) || 0;
    let avail = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    // A page desk's title shares the row down to its flex basis (9rem, changelog 0038).
    const title = el.querySelector<HTMLElement>(':scope > .desk-toolbar__title');
    if (title) avail -= (parseFloat(getComputedStyle(title).flexBasis) || 144) + gap;
    const groups = Array.from(el.querySelectorAll<HTMLElement>(':scope > .desk-toolbar__group'));
    const width = (n: Element | null) => (n ? n.getBoundingClientRect().width : 0);

    if (fold === 0) {
      // Natural one-row widths: groups unwrapped for the read, restored straight after (no paint in between).
      const saved = groups.map((g) => g.getAttribute('style'));
      for (const g of groups) g.style.cssText += ';max-width:none;width:max-content;flex-wrap:nowrap';
      const full = groups.reduce((s, g, i) => s + width(g) + (i ? gap : 0), 0);
      let folded = 0;
      el.querySelectorAll('[data-desk-fold]').forEach((n) => (folded += width(n) + gap));
      const label = el.querySelector<HTMLElement>('.desk-fs-label');
      const fsLabel = label && getComputedStyle(label).position !== 'absolute' ? width(label) + (parseFloat(getComputedStyle(label.parentElement!).columnGap) || 0) : 0;
      groups.forEach((g, i) => (saved[i] === null ? g.removeAttribute('style') : g.setAttribute('style', saved[i]!)));
      need.current = { key, full, folded, fsLabel };
    } else {
      const more = el.querySelector('.desk-toolbar__more');
      if (more) moreW.current = width(more);
    }

    const n = need.current;
    if (!n || n.key !== key) {
      // Stale widths: unfold and measure again (the fold-0 pass always stores a fresh `need`).
      if (fold !== 0) setFold(0);
      return;
    }
    const one = n.full - n.folded + (moreW.current || MORE_ESTIMATE) + gap;
    const two = one - n.fsLabel;
    const fits = (w: number) => w <= avail - 0.5;
    const next: ToolbarFold = fits(n.full) ? 0 : fits(one) ? 1 : fits(two) ? 2 : 0;
    if (next !== fold) setFold(next);
  }, [el, key, tick, fold]);

  return { ref, fold };
}
