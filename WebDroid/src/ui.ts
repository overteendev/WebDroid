export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

export function must<T extends Element>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

export interface DragHandlers {
  /** Decide whether a pointerdown may start a drag. */
  zone?: (event: PointerEvent) => boolean;
  start?: () => void;
  move?: (deltaY: number) => void;
  end?: (deltaY: number, velocity: number) => void;
}

/**
 * Vertical pointer drag with capture, so the gesture keeps tracking outside
 * the element. Velocity is expressed in px/ms.
 */
export function dragY(target: HTMLElement, handlers: DragHandlers): void {
  let pointerId: number | null = null;
  let startY = 0;
  let lastY = 0;
  let lastTime = 0;
  let velocity = 0;

  target.addEventListener('pointerdown', (event: PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (handlers.zone && !handlers.zone(event)) return;
    pointerId = event.pointerId;
    startY = event.clientY;
    lastY = startY;
    lastTime = event.timeStamp;
    velocity = 0;
    target.setPointerCapture(pointerId);
    handlers.start?.();
  });

  target.addEventListener('pointermove', (event: PointerEvent) => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    const deltaTime = Math.max(1, event.timeStamp - lastTime);
    velocity = (event.clientY - lastY) / deltaTime;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    handlers.move?.(event.clientY - startY);
  });

  const finish = (event: PointerEvent): void => {
    if (pointerId === null || event.pointerId !== pointerId) return;
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
    pointerId = null;
    handlers.end?.(event.clientY - startY, velocity);
  };

  target.addEventListener('pointerup', finish);
  target.addEventListener('pointercancel', finish);
}
