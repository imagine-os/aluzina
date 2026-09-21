import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from '../auth/RequireRole';
import { SessionProvider } from '../auth/SessionProvider';
import { Toaster } from '../components/atom/Toast/Toast';
import { DataContextProvider } from '../data/DataContext';
import { ThemeProvider } from '../design/ThemeProvider';
import { DevTools } from '../dev/DevTools';
import { I18nProvider } from '../i18n/I18nProvider';
import { publishManifest } from './manifest';
import { routes, strings } from './registry';
import { RoutesProvider } from './RoutesContext';
import { Shell } from './shells';

publishManifest(routes);

export function App() {
  return (
    <I18nProvider strings={strings}>
      <ThemeProvider>
        <SessionProvider>
          <DataContextProvider>
            <RoutesProvider routes={routes}>
              <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {routes.map((r) => (
                    <Route
                      key={r.path}
                      path={r.path}
                      element={
                        <RequireRole permission={r.permission}>
                          <Shell route={r}>{r.element}</Shell>
                          <DevTools spec={r.spec} />
                        </RequireRole>
                      }
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </HashRouter>
            </RoutesProvider>
            <Toaster />
          </DataContextProvider>
        </SessionProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
