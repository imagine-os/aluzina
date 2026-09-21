import { useEffect, useRef, useState } from 'react';
import { type ActionHandler, isActionLive, listLiveActions, registerAction, subscribeLiveActions } from './bus';

/**
 * Registers `handler` for the action `id` while the component is mounted (P-05: a declared action becomes
 * runnable). The latest handler is always the one that runs, so inline closures are fine. Pass `false` /
 * `undefined` as the handler to skip (e.g. while the person lacks the permission).
 *
 * ```ts
 * useRegisterAction('ops.selectQuote', ({ quote }) => select(String(quote)));
 * ```
 */
export function useRegisterAction(id: string, handler: ActionHandler | false | undefined): void {
  const ref = useRef<ActionHandler | false | undefined>(handler);
  ref.current = handler;
  const enabled = Boolean(handler);
  useEffect(() => {
    if (!enabled) return;
    return registerAction(id, (params) => (ref.current ? ref.current(params) : undefined));
  }, [id, enabled]);
}

/** Registers several actions at once: `useRegisterActions({ 'work.addTask': add, 'work.complete': complete })`. */
export function useRegisterActions(map: Record<string, ActionHandler | false | undefined>): void {
  const ref = useRef(map);
  ref.current = map;
  const key = Object.keys(map)
    .filter((k) => Boolean(map[k]))
    .sort()
    .join('|');
  useEffect(() => {
    const offs = key
      .split('|')
      .filter(Boolean)
      .map((id) =>
        registerAction(id, (params) => {
          const h = ref.current[id];
          return h ? h(params) : undefined;
        }),
      );
    return () => offs.forEach((off) => off());
  }, [key]);
}

/** Live action ids, re-rendering as pages mount and unmount (D-09 actions page, dev panel). */
export function useLiveActions(): string[] {
  const [live, setLive] = useState<string[]>(() => listLiveActions());
  useEffect(() => subscribeLiveActions(() => setLive(listLiveActions())), []);
  return live;
}

export function useIsActionLive(id: string): boolean {
  const live = useLiveActions();
  return live.includes(id) || isActionLive(id);
}
