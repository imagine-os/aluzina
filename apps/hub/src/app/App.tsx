import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from '../components/atom/Toast/Toast';
import { ThemeProvider } from '../design/ThemeProvider';
import { DevModeProvider } from '../dev/DevModeProvider';
import { DevTools } from '../dev/DevTools';
import { I18nProvider } from '../i18n/I18nProvider';
import { publishManifest } from './manifest';
import { routes, strings } from './registry';

publishManifest(routes);

export function App() {
  return (
    <I18nProvider strings={strings}>
      <ThemeProvider>
        <DevModeProvider>
          <HashRouter>
            <Routes>
              {routes.map((r) => (
                <Route
                  key={r.path}
                  path={r.path}
                  element={
                    <>
                      {r.element}
                      <DevTools spec={r.spec} />
                    </>
                  }
                />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
          <Toaster />
        </DevModeProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
