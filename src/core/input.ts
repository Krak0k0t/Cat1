import {
  createDefaultKeyBindings,
  eventToMouseBindingCode,
  loadKeyBindings,
  type KeyBindingsMap,
} from './keybindings';

export type VirtualHeldAction = 'sprint' | 'crouch' | 'purr' | 'glide';
export type VirtualPulseAction = 'jump' | 'chime' | 'interact' | 'dropBait' | 'dash' | 'sense';

export interface InputSnapshot {
  forward: number;
  right: number;
  sprint: boolean;
  crouch: boolean;
  purr: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  dashPressed: boolean;
  sensePressed: boolean;
  chimePressed: boolean;
  interactPressed: boolean;
  dropBaitPressed: boolean;
  rightClickPressed: boolean;
  wheelDelta: number;
  toolSlotPressed: 1 | 2 | 3 | 4 | null;
  resetPressed: boolean;
  pausePressed: boolean;
  togglePanelPressed: boolean;
  toggleOverlayPressed: boolean;
  presetPressed: 1 | 2 | null;
  cameraYawDelta: number;
  cameraPitchDelta: number;
}

export class InputManager {
  private held = new Set<string>();
  private justPressed = new Set<string>();
  private bindings: KeyBindingsMap = loadKeyBindings();
  private captureSuspended = false;
  private dragging = false;
  private dragPointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pendingYawDelta = 0;
  private pendingPitchDelta = 0;
  private pendingRightClick = false;
  private pendingWheelDelta = 0;
  private targetEl: HTMLElement | null = null;

  // Virtual touch pad state for mobile / tablet screens
  private virtualForward = 0;
  private virtualRight = 0;
  private virtualHeld = new Set<VirtualHeldAction>();
  private virtualPulses = new Set<VirtualPulseAction>();

  setKeyBindings(next: KeyBindingsMap): void {
    this.bindings = { ...next };
  }

  getKeyBindings(): KeyBindingsMap {
    return { ...this.bindings };
  }

  setCaptureSuspended(suspended: boolean): void {
    this.captureSuspended = suspended;
    if (suspended) {
      this.clearAll();
    }
  }

  private hasBoundOverride(code: string): boolean {
    for (const val of Object.values(this.bindings)) {
      if (val === code) return true;
    }
    return false;
  }

  setVirtualAxis(forward: number, right: number): void {
    this.virtualForward = Math.max(-1, Math.min(1, forward));
    this.virtualRight = Math.max(-1, Math.min(1, right));
  }

  setVirtualHeld(action: VirtualHeldAction, active: boolean): void {
    if (active) {
      this.virtualHeld.add(action);
    } else {
      this.virtualHeld.delete(action);
    }
  }

  pressVirtualAction(action: VirtualPulseAction): void {
    this.virtualPulses.add(action);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.captureSuspended) return;
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (
      e.code === 'Space' ||
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight' ||
      e.code === 'Tab'
    ) {
      e.preventDefault();
    }
    if (!e.repeat && !this.held.has(e.code)) {
      this.justPressed.add(e.code);
    }
    this.held.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.held.delete(e.code);
  };

  private onPointerDown = (e: PointerEvent) => {
    if (this.captureSuspended) return;
    const mouseCode = eventToMouseBindingCode(e.button);
    if (mouseCode) {
      if (!this.held.has(mouseCode)) {
        this.justPressed.add(mouseCode);
      }
      this.held.add(mouseCode);
    }
    // Primary pointer drags camera unless bound strictly; right click triggers configurable / bound action
    if (e.button === 0 && this.dragPointerId === null) {
      this.dragging = true;
      this.dragPointerId = e.pointerId;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    } else if (e.button === 2) {
      e.preventDefault();
      // Only fire legacy right-click fallback when Mouse2 is not bound to an explicit action
      if (!this.hasBoundOverride('Mouse2')) {
        this.pendingRightClick = true;
      }
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.captureSuspended) return;
    if (document.pointerLockElement === this.targetEl) {
      this.pendingYawDelta -= e.movementX * 0.0028;
      this.pendingPitchDelta -= e.movementY * 0.0022;
      return;
    }
    if (!this.dragging || (this.dragPointerId !== null && e.pointerId !== this.dragPointerId)) return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.pendingYawDelta -= dx * 0.0055;
    this.pendingPitchDelta -= dy * 0.0042;
  };

  private onPointerUp = (e: PointerEvent) => {
    const mouseCode = eventToMouseBindingCode(e.button);
    if (mouseCode) {
      this.held.delete(mouseCode);
    }
    if (this.dragPointerId === e.pointerId || e.button === 0) {
      this.dragging = false;
      this.dragPointerId = null;
    }
  };

  private onPointerCancel = (e: PointerEvent) => {
    const mouseCode = eventToMouseBindingCode(e.button);
    if (mouseCode) {
      this.held.delete(mouseCode);
    }
    if (this.dragPointerId === e.pointerId) {
      this.dragging = false;
      this.dragPointerId = null;
    }
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onWheel = (e: WheelEvent) => {
    if (this.captureSuspended) return;
    if (Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    this.pendingWheelDelta += e.deltaY > 0 ? 1 : -1;
  };

  private onBlur = () => {
    this.clearAll();
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.clearAll();
    }
  };

  attach(el: HTMLElement): () => void {
    this.targetEl = el;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('contextmenu', this.onContextMenu);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerCancel);

    return () => {
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('keyup', this.onKeyUp);
      window.removeEventListener('blur', this.onBlur);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      el.removeEventListener('pointerdown', this.onPointerDown);
      el.removeEventListener('contextmenu', this.onContextMenu);
      el.removeEventListener('wheel', this.onWheel);
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerCancel);
      this.targetEl = null;
      this.clearAll();
    };
  }

  clearAll(): void {
    this.held.clear();
    this.justPressed.clear();
    this.virtualHeld.clear();
    this.virtualPulses.clear();
    this.virtualForward = 0;
    this.virtualRight = 0;
    this.dragging = false;
    this.dragPointerId = null;
    this.pendingYawDelta = 0;
    this.pendingPitchDelta = 0;
    this.pendingRightClick = false;
    this.pendingWheelDelta = 0;
  }

  consume(out: InputSnapshot): void {
    const b = this.bindings ?? createDefaultKeyBindings();
    const isArrowFree = (code: string) => !this.hasBoundOverride(code);

    const fwdHeld =
      this.held.has(b.moveForward) || (isArrowFree('ArrowUp') && this.held.has('ArrowUp'));
    const bwdHeld =
      this.held.has(b.moveBackward) || (isArrowFree('ArrowDown') && this.held.has('ArrowDown'));
    const rgtHeld =
      this.held.has(b.moveRight) || (isArrowFree('ArrowRight') && this.held.has('ArrowRight'));
    const lftHeld =
      this.held.has(b.moveLeft) || (isArrowFree('ArrowLeft') && this.held.has('ArrowLeft'));

    const keyFwd = (fwdHeld ? 1 : 0) - (bwdHeld ? 1 : 0);
    const keyRgt = (rgtHeld ? 1 : 0) - (lftHeld ? 1 : 0);

    out.forward = Math.abs(this.virtualForward) > 0.08 ? this.virtualForward : keyFwd;
    out.right = Math.abs(this.virtualRight) > 0.08 ? this.virtualRight : keyRgt;
    out.sprint =
      this.held.has(b.sprint) ||
      (isArrowFree('ShiftRight') && this.held.has('ShiftRight')) ||
      this.virtualHeld.has('sprint');
    out.crouch =
      this.held.has(b.crouch) ||
      (isArrowFree('ControlLeft') && this.held.has('ControlLeft')) ||
      (isArrowFree('ControlRight') && this.held.has('ControlRight')) ||
      this.virtualHeld.has('crouch');
    out.purr =
      this.held.has(b.purr) ||
      this.justPressed.has(b.purr) ||
      this.virtualHeld.has('purr');
    out.jumpPressed = this.justPressed.has(b.jump) || this.virtualPulses.has('jump');
    out.jumpHeld = this.held.has(b.jump) || this.virtualHeld.has('glide');
    out.dashPressed = this.justPressed.has(b.dash) || this.virtualPulses.has('dash');
    out.sensePressed = this.justPressed.has(b.sense) || this.virtualPulses.has('sense');
    out.chimePressed = this.justPressed.has(b.useTool) || this.virtualPulses.has('chime');
    out.interactPressed =
      this.justPressed.has(b.interact) ||
      (isArrowFree('Enter') && this.justPressed.has('Enter')) ||
      this.virtualPulses.has('interact');
    out.dropBaitPressed = this.justPressed.has(b.dropBait) || this.virtualPulses.has('dropBait');
    out.rightClickPressed = this.pendingRightClick;
    out.wheelDelta = this.pendingWheelDelta;
    out.toolSlotPressed = this.justPressed.has('Digit1')
      ? 1
      : this.justPressed.has('Digit2')
        ? 2
        : this.justPressed.has('Digit3')
          ? 3
          : this.justPressed.has('Digit4')
            ? 4
            : null;
    out.resetPressed = this.justPressed.has(b.reset);
    out.pausePressed =
      this.justPressed.has(b.pause) ||
      (isArrowFree('KeyP') && this.justPressed.has('KeyP'));
    out.togglePanelPressed = this.justPressed.has('Tab');
    out.toggleOverlayPressed = this.justPressed.has('KeyO');
    out.presetPressed = this.justPressed.has('F1')
      ? 1
      : this.justPressed.has('F2')
        ? 2
        : null;

    // Optional camera orbit keys J/L when not bound to an action
    const keyOrbit =
      (isArrowFree('KeyJ') && this.held.has('KeyJ') ? 1 : 0) -
      (isArrowFree('KeyL') && this.held.has('KeyL') ? 1 : 0);
    out.cameraYawDelta = this.pendingYawDelta + keyOrbit * 0.032;
    out.cameraPitchDelta = this.pendingPitchDelta;

    this.justPressed.clear();
    this.virtualPulses.clear();
    this.pendingYawDelta = 0;
    this.pendingPitchDelta = 0;
    this.pendingRightClick = false;
    this.pendingWheelDelta = 0;
  }
}
