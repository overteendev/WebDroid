import type { AppDef } from './apps';
import { glyph } from './icons';

export function appButton(app: AppDef, options: { label?: boolean } = {}): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'app';
  button.dataset.appId = app.id;
  button.title = app.name;
  button.setAttribute('aria-label', `Open ${app.name}`);

  const icon = document.createElement('span');
  icon.className = 'app-icon';
  icon.style.setProperty('--app-color', app.color);
  icon.innerHTML = glyph(app.glyph, 25, 1.9);
  button.append(icon);

  if (options.label !== false) {
    const label = document.createElement('span');
    label.className = 'app-label';
    label.textContent = app.name;
    button.append(label);
  }

  return button;
}
