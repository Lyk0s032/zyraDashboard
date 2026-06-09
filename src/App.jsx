import { AppProvider } from './estados/AppContext';
import { RainModeProvider } from './estados/RainModeContext';
import { AccessibilityProvider } from './estados/AccessibilityContext';
import { CourtBlockProvider } from './estados/CourtBlockContext';
import AppRouter from './AppRouter';
import TokenDebugger from './componentes/TokenDebugger';
import './App.css';

function App() {
  return (
    <AppProvider>
      <AccessibilityProvider>
        <CourtBlockProvider>
          <RainModeProvider>
            <AppRouter />
            <TokenDebugger />
          </RainModeProvider>
        </CourtBlockProvider>
      </AccessibilityProvider>
    </AppProvider>
  );
}

export default App;
