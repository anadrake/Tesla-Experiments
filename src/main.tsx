import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fonts are bundled (latin subsets) so the Home Screen app works offline — no Google Fonts request.
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/source-sans-3/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/montserrat/latin-400.css';
import './tokens/tokens.css';
import './global.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
