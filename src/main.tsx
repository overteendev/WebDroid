import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/bricolage-grotesque/800.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'material-symbols/rounded.css';
import App from './App.tsx';
import './index.css';

registerSW({immediate: true});

createRoot(document.getElementById('root')!).render(<App />);
