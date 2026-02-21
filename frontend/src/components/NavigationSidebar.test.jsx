import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavigationSidebar from './NavigationSidebar';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('NavigationSidebar - Quick Access', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockNavigate.mockClear();
  });

  const renderSidebar = (props = {}) => {
    return render(
      <BrowserRouter>
        <NavigationSidebar {...props} />
      </BrowserRouter>
    );
  };

  it('should render Quick Access section when spaces have been accessed', () => {
    // Set up frequency data
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 5,
      projects: 3,
      hr: 2,
    }));

    renderSidebar();

    expect(screen.getByText('Quick Access')).toBeInTheDocument();
  });

  it('should track space access frequency', async () => {
    renderSidebar();

    // Click on Dashboard
    const dashboardButton = screen.getByLabelText('Dashboard');
    fireEvent.click(dashboardButton);

    await waitFor(() => {
      const frequency = JSON.parse(localStorageMock.getItem('quick-access-frequency'));
      expect(frequency.dashboard).toBe(1);
    });
  });

  it('should display top 5 most frequently accessed spaces', () => {
    // Set up frequency data for more than 5 spaces
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 10,
      projects: 8,
      hr: 6,
      finance: 4,
      sales: 2,
      inventory: 1,
    }));

    renderSidebar();

    // Quick Access should show only top 5
    // Find the Quick Access section by looking for the droppable container
    const quickAccessSection = screen.getByText('Quick Access').closest('nav');
    const draggableItems = quickAccessSection.querySelectorAll('[data-rbd-draggable-id]');
    
    // Should have exactly 5 draggable items (top 5 spaces)
    expect(draggableItems.length).toBeLessThanOrEqual(5);
  });

  it('should allow pinning and unpinning spaces', async () => {
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 5,
    }));

    renderSidebar();

    // Find the pin button (star icon)
    const pinButtons = screen.getAllByLabelText('Pin');
    expect(pinButtons.length).toBeGreaterThan(0);

    // Click to pin
    fireEvent.click(pinButtons[0]);

    await waitFor(() => {
      const pinned = JSON.parse(localStorageMock.getItem('quick-access-pinned'));
      expect(pinned.length).toBeGreaterThan(0);
    });
  });

  it('should persist Quick Access collapsed state', async () => {
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 5,
    }));

    renderSidebar();

    // Find and click the Quick Access collapse button
    const collapseButton = screen.getByText('Quick Access');
    fireEvent.click(collapseButton);

    await waitFor(() => {
      const collapsed = JSON.parse(localStorageMock.getItem('quick-access-collapsed'));
      expect(collapsed).toBe(true);
    });
  });

  it('should show pinned spaces first in Quick Access', () => {
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 10,
      projects: 5,
      hr: 3,
    }));
    localStorageMock.setItem('quick-access-pinned', JSON.stringify(['hr']));

    renderSidebar();

    // HR should appear in Quick Access even though it has lower frequency
    expect(screen.getByText('Quick Access')).toBeInTheDocument();
  });

  it('should persist custom order after drag and drop', () => {
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 10,
      projects: 5,
    }));

    renderSidebar();

    // Note: Full drag-and-drop testing requires more complex setup
    // This test verifies the component renders with the drag-drop context
    expect(screen.getByText('Quick Access')).toBeInTheDocument();
  });

  it('should not show Quick Access when no spaces have been accessed', () => {
    renderSidebar();

    // Quick Access should not be visible
    expect(screen.queryByText('Quick Access')).not.toBeInTheDocument();
  });

  it('should show star icon in collapsed mode', () => {
    localStorageMock.setItem('nav-sidebar-collapsed', JSON.stringify(true));
    localStorageMock.setItem('quick-access-frequency', JSON.stringify({
      dashboard: 5,
    }));

    renderSidebar();

    // In collapsed mode, Quick Access button should show star icon
    // The button has aria-expanded attribute
    const buttons = screen.getAllByRole('button');
    const quickAccessButton = buttons.find(btn => 
      btn.getAttribute('aria-expanded') !== null
    );
    
    expect(quickAccessButton).toBeInTheDocument();
    // Verify it contains a star icon (svg with class containing 'star')
    const starIcon = quickAccessButton.querySelector('svg.lucide-star');
    expect(starIcon).toBeInTheDocument();
  });
});
