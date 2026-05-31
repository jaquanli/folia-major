import { describe, expect, it } from 'vitest';
import { isNavigationViewState, resolveOverlayPopState, resolveOverlayPushState } from '@/hooks/useAppNavigation';

describe('useAppNavigation state helpers', () => {
    it('keeps overlays in the home view when opening from home', () => {
        expect(resolveOverlayPushState('home', 0, null)).toEqual({
            view: 'home',
            overlayView: 'home',
            overlayOriginView: 'home',
        });
    });

    it('keeps overlays in the home view when opening from player and remembers the origin', () => {
        expect(resolveOverlayPushState('player', 0, null)).toEqual({
            view: 'home',
            overlayView: 'home',
            overlayOriginView: 'player',
        });
    });

    it('restores the previous overlay in home instead of player when popping nested overlays', () => {
        expect(resolveOverlayPopState(1, 'home')).toEqual({
            view: 'home',
            overlayView: 'home',
            overlayOriginView: 'home',
        });
    });

    it('returns to the remembered origin after the last overlay closes', () => {
        expect(resolveOverlayPopState(0, 'player')).toEqual({
            view: 'player',
            overlayView: null,
            overlayOriginView: null,
        });
    });

    it('accepts visEditor as a restorable app view', () => {
        expect(isNavigationViewState('visEditor')).toBe(true);
        expect(isNavigationViewState('vis-editor')).toBe(false);
    });

    it('remembers visEditor as the origin when opening overlays from the editor', () => {
        expect(resolveOverlayPushState('visEditor', 0, null)).toEqual({
            view: 'home',
            overlayView: 'home',
            overlayOriginView: 'visEditor',
        });
    });

    it('returns to visEditor after the last overlay closes when it was the origin', () => {
        expect(resolveOverlayPopState(0, 'visEditor')).toEqual({
            view: 'visEditor',
            overlayView: null,
            overlayOriginView: null,
        });
    });
});
