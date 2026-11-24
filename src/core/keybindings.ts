export type BindableAction =
  | 'moveForward'
  | 'moveBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'sprint'
  | 'crouch'
  | 'purr'
  | 'dash'
  | 'sense'
  | 'useTool'
  | 'interact'
  | 'dropBait'
  | 'pause'
  | 'reset'
  | 'toggleHud';

export type KeyBindingsMap = Record<BindableAction, string>;

export const KEYBINDINGS_STORAGE_KEY = 'sunken_chime_keybindings_v1';

export const BINDABLE_ACTION_ORDER: readonly BindableAction[] = [
  'moveForward',
  'moveBackward',
  'moveLeft',
  'moveRight',
  'jump',
  'sprint',
  'crouch',
  'purr',
  'dash',
  'sense',
  'useTool',
  'interact',
  'dropBait',
  'pause',
  'reset',
  'toggleHud',
] as const;

export const DEFAULT_KEYBINDINGS: KeyBindingsMap = {
  moveForward: 'KeyW',
  moveBackward: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  jump: 'Space',
  sprint: 'ShiftLeft',
  crouch: 'KeyC',
  purr: 'KeyF',
  dash: 'KeyX',
  sense: 'KeyV',
  useTool: 'KeyE',
  interact: 'KeyQ',
  dropBait: 'KeyG',
  pause: 'Escape',
  reset: 'KeyR',
  toggleHud: 'KeyH',
};

export function createDefaultKeyBindings(): KeyBindingsMap {
  return { ...DEFAULT_KEYBINDINGS };
}

export function eventToMouseBindingCode(button: number): string | null {
  if (button === 0) return 'Mouse0';
  if (button === 1) return 'Mouse1';
  if (button === 2) return 'Mouse2';
  return null;
}

export function isValidBindingCode(code: unknown): code is string {
  return typeof code === 'string' && code.length > 0 && code.length <= 24;
}

export function normalizeKeyBindings(raw: unknown): KeyBindingsMap {
  const next = createDefaultKeyBindings();
  if (!raw || typeof raw !== 'object') return next;
  const record = raw as Record<string, unknown>;
  const used = new Set<string>();
  for (const action of BINDABLE_ACTION_ORDER) {
    const candidate = record[action];
    if (isValidBindingCode(candidate) && !used.has(candidate)) {
      next[action] = candidate;
      used.add(candidate);
    } else {
      used.add(next[action]);
    }
  }
  // Resolve any accidental default collision after partial load
  const seen = new Map<string, BindableAction>();
  for (const action of BINDABLE_ACTION_ORDER) {
    const code = next[action];
    if (!seen.has(code)) {
      seen.set(code, action);
    } else {
      return createDefaultKeyBindings();
    }
  }
  return next;
}

export function loadKeyBindings(): KeyBindingsMap {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createDefaultKeyBindings();
    }
    const raw = window.localStorage.getItem(KEYBINDINGS_STORAGE_KEY);
    if (!raw) return createDefaultKeyBindings();
    return normalizeKeyBindings(JSON.parse(raw));
  } catch {
    return createDefaultKeyBindings();
  }
}

export function saveKeyBindings(bindings: KeyBindingsMap): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(KEYBINDINGS_STORAGE_KEY, JSON.stringify(bindings));
  } catch {
    // Ignore storage quota or sandbox errors
  }
}

export function resetKeyBindings(): KeyBindingsMap {
  const fresh = createDefaultKeyBindings();
  saveKeyBindings(fresh);
  return fresh;
}

/**
 * Rebinds `action` to `newCode`. If another action already uses `newCode`,
 * the previous binding of `action` is swapped to that conflicting action so
 * no game action is ever silently left unbound.
 */
export function rebindAction(
  bindings: KeyBindingsMap,
  action: BindableAction,
  newCode: string
): KeyBindingsMap {
  if (!isValidBindingCode(newCode)) return bindings;
  const previousCode = bindings[action];
  if (previousCode === newCode) return bindings;

  const updated: KeyBindingsMap = { ...bindings };
  for (const other of BINDABLE_ACTION_ORDER) {
    if (other !== action && updated[other] === newCode) {
      updated[other] = previousCode;
      break;
    }
  }
  updated[action] = newCode;
  return updated;
}

export function formatKeyCode(code: string): string {
  switch (code) {
    case 'Mouse0':
      return 'LMB';
    case 'Mouse1':
      return 'MMB';
    case 'Mouse2':
      return 'RMB';
    case 'Space':
      return 'Space';
    case 'ShiftLeft':
      return 'L-Shift';
    case 'ShiftRight':
      return 'R-Shift';
    case 'ControlLeft':
      return 'L-Ctrl';
    case 'ControlRight':
      return 'R-Ctrl';
    case 'AltLeft':
      return 'L-Alt';
    case 'AltRight':
      return 'R-Alt';
    case 'Escape':
      return 'Esc';
    case 'Enter':
      return 'Enter';
    case 'Tab':
      return 'Tab';
    case 'Backspace':
      return 'Bksp';
    case 'ArrowUp':
      return 'Up';
    case 'ArrowDown':
      return 'Down';
    case 'ArrowLeft':
      return 'Left';
    case 'ArrowRight':
      return 'Right';
    default: {
      if (code.startsWith('Key') && code.length === 4) {
        return code.slice(3).toUpperCase();
      }
      if (code.startsWith('Digit') && code.length === 6) {
        return code.slice(5);
      }
      if (code.startsWith('Numpad')) {
        return `Num${code.slice(6)}`;
      }
      return code;
    }
  }
}
