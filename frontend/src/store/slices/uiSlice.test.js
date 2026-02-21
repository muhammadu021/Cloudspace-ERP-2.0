import { describe, it, expect } from 'vitest';
import uiReducer, {
  toggleSidebar,
  setSidebarCollapsed,
  setActiveSpace,
  setTheme,
  toggleTheme,
  openModal,
  closeModal,
  addToast,
  removeToast,
  selectSidebarCollapsed,
  selectTheme,
} from './uiSlice';

describe('uiSlice', () => {
  const initialState = {
    sidebar: {
      collapsed: false,
      activeSpace: 'dashboard',
    },
    theme: 'light',
    modals: [],
    toasts: [],
    loading: {},
  };

  it('should return initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle toggleSidebar', () => {
    const state1 = uiReducer(initialState, toggleSidebar());
    expect(state1.sidebar.collapsed).toBe(true);

    const state2 = uiReducer(state1, toggleSidebar());
    expect(state2.sidebar.collapsed).toBe(false);
  });

  it('should handle setSidebarCollapsed', () => {
    const state = uiReducer(initialState, setSidebarCollapsed(true));
    expect(state.sidebar.collapsed).toBe(true);
  });

  it('should handle setActiveSpace', () => {
    const state = uiReducer(initialState, setActiveSpace('projects'));
    expect(state.sidebar.activeSpace).toBe('projects');
  });

  it('should handle setTheme', () => {
    const state = uiReducer(initialState, setTheme('dark'));
    expect(state.theme).toBe('dark');
  });

  it('should handle toggleTheme', () => {
    const state1 = uiReducer(initialState, toggleTheme());
    expect(state1.theme).toBe('dark');

    const state2 = uiReducer(state1, toggleTheme());
    expect(state2.theme).toBe('light');
  });

  it('should handle openModal', () => {
    const modal = {
      id: 'test-modal',
      type: 'confirm',
      props: { title: 'Test' },
    };

    const state = uiReducer(initialState, openModal(modal));
    expect(state.modals).toHaveLength(1);
    expect(state.modals[0]).toMatchObject({
      id: 'test-modal',
      type: 'confirm',
      props: { title: 'Test' },
      open: true,
    });
  });

  it('should handle closeModal', () => {
    const stateWithModal = {
      ...initialState,
      modals: [
        { id: 'modal-1', type: 'confirm', props: {}, open: true },
        { id: 'modal-2', type: 'alert', props: {}, open: true },
      ],
    };

    const state = uiReducer(stateWithModal, closeModal('modal-1'));
    expect(state.modals).toHaveLength(1);
    expect(state.modals[0].id).toBe('modal-2');
  });

  it('should handle addToast', () => {
    const toast = {
      id: 'test-toast',
      type: 'success',
      message: 'Test message',
      duration: 3000,
    };

    const state = uiReducer(initialState, addToast(toast));
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toMatchObject({
      id: 'test-toast',
      type: 'success',
      message: 'Test message',
      duration: 3000,
    });
  });

  it('should handle removeToast', () => {
    const stateWithToasts = {
      ...initialState,
      toasts: [
        { id: 'toast-1', type: 'success', message: 'Test 1' },
        { id: 'toast-2', type: 'error', message: 'Test 2' },
      ],
    };

    const state = uiReducer(stateWithToasts, removeToast('toast-1'));
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].id).toBe('toast-2');
  });

  describe('selectors', () => {
    const mockState = {
      ui: {
        sidebar: {
          collapsed: true,
          activeSpace: 'projects',
        },
        theme: 'dark',
        modals: [],
        toasts: [],
        loading: {},
      },
    };

    it('should select sidebar collapsed state', () => {
      expect(selectSidebarCollapsed(mockState)).toBe(true);
    });

    it('should select theme', () => {
      expect(selectTheme(mockState)).toBe('dark');
    });
  });
});
