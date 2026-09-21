import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/atom/Button/Button';
import { EmptyState } from '../components/molecule/EmptyState/EmptyState';
import { useT } from '../i18n/I18nProvider';
import { rolesWith } from './permissions';
import { ROLE_META, isRoleId } from './roles';
import { useSession } from './SessionProvider';
import './RequireRole.css';

interface RequireRoleProps {
  /** Omit for public routes. */
  permission?: string;
  children: ReactNode;
}

/**
 * Guards a route by permission (D-015). Identity is mocked, the guard is real: an unauthorized
 * visit renders a real bilingual page with one "switch role" button per role that can, plus "Back to hub".
 */
export function RequireRole({ permission, children }: RequireRoleProps) {
  const { can } = useSession();
  if (!permission || can(permission)) return <>{children}</>;
  return <Unauthorized permission={permission} />;
}

function Unauthorized({ permission }: { permission: string }) {
  const { t } = useT();
  const { role, switchUser } = useSession();
  const navigate = useNavigate();
  const candidates = rolesWith(permission).filter(isRoleId);

  return (
    <main className="unauthorized" data-unauthorized={permission}>
      <EmptyState
        title={t('core.auth.deniedTitle')}
        description={t('core.auth.deniedBody', { permission, role: t(isRoleId(role) ? ROLE_META[role].labelKey : 'core.role.unknown') })}
        glyph="⚿"
      >
        <div className="unauthorized__actions">
          {candidates.map((r) => (
            <Button key={r} variant="primary" onClick={() => switchUser(r)}>
              {t('core.auth.switchTo', { role: t(ROLE_META[r].labelKey) })}
            </Button>
          ))}
          <Button variant="ghost" onClick={() => navigate('/')}>
            {t('core.shell.backToHub')}
          </Button>
        </div>
      </EmptyState>
    </main>
  );
}
