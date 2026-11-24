import React, { useEffect, useState } from 'react';
import {
  BINDABLE_ACTION_ORDER,
  eventToMouseBindingCode,
  formatKeyCode,
  rebindAction,
  resetKeyBindings,
  type BindableAction,
  type KeyBindingsMap,
} from '../core/keybindings';
import type { UiLocaleBundle } from '../data/i18n';
import { soundEngine } from '../core/audio';
import { CornerFiligree } from './CornerFiligree';

interface ControlsModalProps {
  locale: UiLocaleBundle;
  bindings: KeyBindingsMap;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onChangeBindings: (next: KeyBindingsMap) => void;
  onClose: () => void;
}

export const ControlsModal: React.FC<ControlsModalProps> = ({
  locale,
  bindings,
  isFullscreen,
  onToggleFullscreen,
  onChangeBindings,
  onClose,
}) => {
  const [listeningAction, setListeningAction] = useState<BindableAction | null>(null);

  useEffect(() => {
    if (!listeningAction) {
      const onIdleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      };
      window.addEventListener('keydown', onIdleKeyDown, true);
      return () => window.removeEventListener('keydown', onIdleKeyDown, true);
    }

    let cancelled = false;
    let attached = false;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        setListeningAction(null);
        return;
      }
      if (!e.code || e.code === 'Unidentified') return;
      soundEngine.unlock();
      soundEngine.playUiHover();
      onChangeBindings(rebindAction(bindings, listeningAction, e.code));
      setListeningAction(null);
    };

    const onMouseDown = (e: MouseEvent) => {
      const code = eventToMouseBindingCode(e.button);
      if (!code) return;
      e.preventDefault();
      e.stopPropagation();
      soundEngine.unlock();
      soundEngine.playUiHover();
      onChangeBindings(rebindAction(bindings, listeningAction, code));
      setListeningAction(null);
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      attached = true;
      window.addEventListener('keydown', onKeyDown, true);
      window.addEventListener('mousedown', onMouseDown, true);
      window.addEventListener('contextmenu', onContextMenu, true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (attached) {
        window.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('mousedown', onMouseDown, true);
        window.removeEventListener('contextmenu', onContextMenu, true);
      }
    };
  }, [listeningAction, bindings, onChangeBindings, onClose]);

  const handleReset = () => {
    soundEngine.unlock();
    soundEngine.playUiHover();
    setListeningAction(null);
    onChangeBindings(resetKeyBindings());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={locale.controlsModal.title}
      data-testid="controls-modal"
      className="fixed inset-0 z-45 flex items-center justify-center bg-[#0D1619]/84 p-2.5 sm:p-6 overflow-y-auto"
    >
      <div className="luxury-panel-sheen modal-panel-enter relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto my-auto bg-[#121C20] border border-[#F4A949]/80 p-3.5 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl">
        <CornerFiligree />

        <div className="flex items-start justify-between gap-3 border-b border-[#8F5E46]/45 pb-3">
          <div className="min-w-0">
            <h2
              className="text-lg sm:text-2xl font-semibold text-[#F7EEDC]"
              style={{ fontFamily: "'Palatino Linotype', 'Book Antiqua', Georgia, serif" }}
            >
              {locale.controlsModal.title}
            </h2>
            <p className="text-xs text-[#9EB4AD] mt-1 leading-snug">
              {locale.controlsModal.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="controls-fullscreen-toggle"
              aria-label={isFullscreen ? locale.actions.fullscreenExit : locale.actions.fullscreenEnter}
              title={isFullscreen ? locale.actions.fullscreenExit : locale.actions.fullscreenEnter}
              onClick={onToggleFullscreen}
              className="menu-btn-interactive h-8 px-2.5 flex items-center justify-center bg-[#1A282D] border border-[#8F5E46]/70 text-xs font-mono text-[#EFE6D5] cursor-pointer"
            >
              <span>{isFullscreen ? '⤢' : '⛶'}</span>
            </button>
            <button
              type="button"
              data-testid="controls-close-btn"
              onClick={() => {
                setListeningAction(null);
                onClose();
              }}
              className="menu-btn-interactive h-8 px-3 bg-[#1A282D] border border-[#8F5E46]/70 text-xs font-mono text-[#EFE6D5] cursor-pointer"
            >
              {locale.controlsModal.close}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[54dvh] overflow-y-auto pr-0.5">
          {BINDABLE_ACTION_ORDER.map((action) => {
            const isListening = listeningAction === action;
            const actionLabel = locale.controlsModal.actions[action];
            const keyLabel = isListening
              ? locale.controlsModal.pressAnyKey
              : formatKeyCode(bindings[action]);
            return (
              <div
                key={action}
                className={`flex items-center justify-between gap-2 px-3 py-2 border transition-colors ${
                  isListening
                    ? 'bg-[#2B2418] border-[#F4A949]'
                    : 'bg-[#1A282D] border-[#8F5E46]/45'
                }`}
              >
                <span className="text-xs sm:text-[13px] text-[#F7EEDC] truncate">
                  {actionLabel}
                </span>
                <button
                  type="button"
                  data-testid={`rebind-btn-${action}`}
                  aria-label={`${actionLabel}: ${keyLabel}`}
                  onMouseEnter={() => {
                    soundEngine.unlock();
                    soundEngine.playUiHover();
                  }}
                  onClick={() => setListeningAction(isListening ? null : action)}
                  className={`menu-btn-interactive shrink-0 min-w-[82px] px-2.5 py-1 text-xs font-mono border text-center cursor-pointer ${
                    isListening
                      ? 'bg-[#F4A949] border-[#FFD5A5] text-[#142024] font-bold animate-pulse'
                      : 'bg-[#121C20] border-[#8F5E46]/70 text-[#FFD5A5] hover:border-[#F4A949]'
                  }`}
                >
                  {keyLabel}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#8F5E46]/40 pt-3">
          <p className="text-[11px] font-mono text-[#9EB4AD]">
            {locale.controlsModal.mouseHint}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              data-testid="controls-reset-btn"
              onMouseEnter={() => {
                soundEngine.unlock();
                soundEngine.playUiHover();
              }}
              onClick={handleReset}
              className="menu-btn-interactive px-3 py-1.5 bg-[#1D2C31] border border-[#8F5E46]/70 text-xs font-mono text-[#EFE6D5] cursor-pointer"
            >
              {locale.controlsModal.resetDefaults}
            </button>
            <button
              type="button"
              onMouseEnter={() => {
                soundEngine.unlock();
                soundEngine.playUiHover();
              }}
              onClick={() => {
                setListeningAction(null);
                onClose();
              }}
              className="menu-btn-interactive px-4 py-1.5 bg-[#F4A949] hover:bg-[#FFD5A5] border border-[#FFD5A5] text-xs font-semibold uppercase tracking-[0.06em] text-[#142024] cursor-pointer"
            >
              {locale.controlsModal.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
