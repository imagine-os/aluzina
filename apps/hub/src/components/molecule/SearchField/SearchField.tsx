import { useT } from '../../../i18n/I18nProvider';
import { Button } from '../../atom/Button/Button';
import { Input } from '../../atom/Input/Input';
import './SearchField.css';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

/** Search input with a clear button; the label is visually hidden by default. */
export function SearchField({ value, onChange, label, placeholder }: SearchFieldProps) {
  const { t } = useT();
  return (
    <div className="search" role="search">
      <Input type="search" label={label ?? t('core.search.label')} hideLabel placeholder={placeholder ?? t('core.search.placeholder')} value={value} onChange={(e) => onChange(e.target.value)} prefix="⌕" autoComplete="off" />
      {value && <Button variant="ghost" aria-label={t('core.search.clear')} icon="×" onClick={() => onChange('')} />}
    </div>
  );
}
