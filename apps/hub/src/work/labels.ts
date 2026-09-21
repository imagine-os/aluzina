import { useMemo } from 'react';
import type { Priority, TaskStatus } from '../data/schema';
import { formatDate } from '../i18n/format';
import { useT } from '../i18n/I18nProvider';
import { minutesAgo, type GroupLabels, type WorkPerson } from './model';

/** Translated labels the work views share (group names, "5 min ago", status and priority words). */
export function useWorkLabels(people: WorkPerson[] = []) {
  const { t, lang } = useT();
  return useMemo(() => {
    const status = (s: TaskStatus) => t(`core.status.${s}`);
    const priority = (p: Priority) => t(`core.priority.${p}`);
    const person = (id: string | null | undefined) => (id && people.find((p) => p.id === id)?.name) || t('core.work.unassigned');
    const ago = (iso: string) => {
      const m = minutesAgo(iso);
      if (m < 1) return t('core.work.ago.now');
      if (m < 60) return t('core.work.ago.min', { n: m });
      if (m < 60 * 24) return t('core.work.ago.hour', { n: Math.round(m / 60) });
      return t('core.work.ago.day', { n: Math.round(m / 1440) });
    };
    const date = (iso: string | null | undefined) => formatDate(iso, lang, { day: 'numeric', month: 'short' });
    const groups: GroupLabels = {
      noSection: t('core.work.noSection'),
      noProject: t('core.work.noProject'),
      unassigned: t('core.work.unassigned'),
      status,
      due: (w) => t(`core.work.due.${w}`),
    };
    return { t, lang, status, priority, person, ago, date, groups };
  }, [t, lang, people]);
}
