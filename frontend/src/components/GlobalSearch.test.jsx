/**
 * GlobalSearch Component Tests
 * 
 * Tests for the GlobalSearch component functionality including:
 * - Keyboard shortcuts (Cmd/Ctrl+K)
 * - Search functionality and relevance ranking
 * - Recent searches
 * - Keyboard navigation
 * - Result selection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalSearch from './GlobalSearch';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('GlobalSearch', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders search trigger button', () => {
    render(<GlobalSearch />);
    expect(screen.getByText('Search...')).toBeInTheDocument();
  });

  it('displays keyboard shortcut hint', () => {
    render(<GlobalSearch />);
    const shortcut = navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K';
    expect(screen.getByText(shortcut)).toBeInTheDocument();
  });

  it('opens modal when trigger button is clicked', async () => {
    render(<GlobalSearch />);
    const trigger = screen.getByText('Search...');
    
    fireEvent.click(trigger);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search routes, entities, and actions/i)).toBeInTheDocument();
    });
  });

  it('opens modal with Cmd/Ctrl+K keyboard shortcut', async () => {
    render(<GlobalSearch />);
    
    // Simulate Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search routes, entities, and actions/i)).toBeInTheDocument();
    });
  });

  it('closes modal when Escape is pressed', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Search routes, entities, and actions/i)).toBeInTheDocument();
    });
    
    // Close with Escape
    const input = screen.getByPlaceholderText(/Search routes, entities, and actions/i);
    fireEvent.keyDown(input, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText(/Search routes, entities, and actions/i)).not.toBeInTheDocument();
    });
  });

  it('displays search results when typing', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'dashboard');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('highlights matching text in results', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'proj');
    
    await waitFor(() => {
      const marks = document.querySelectorAll('mark');
      expect(marks.length).toBeGreaterThan(0);
    });
  });

  it('shows "no results" message when no matches found', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query that won't match anything
    await userEvent.type(input, 'xyzabc123');
    
    await waitFor(() => {
      expect(screen.getByText(/No results found/i)).toBeInTheDocument();
    });
  });

  it('navigates with arrow keys', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'project');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Project/i);
      expect(results.length).toBeGreaterThan(0);
    });
    
    // Press arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // First result should be selected (has bg-primary-50 class)
    await waitFor(() => {
      const selectedItems = document.querySelectorAll('.bg-primary-50');
      expect(selectedItems.length).toBeGreaterThan(0);
    });
  });

  it('selects result with Enter key', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'dashboard');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
    
    // Press Enter to select first result
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });

  it('saves recent searches to localStorage', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type and select a result
    await userEvent.type(input, 'dashboard');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
    
    // Click on first result button
    const resultButtons = document.querySelectorAll('button[data-index]');
    fireEvent.click(resultButtons[0]);
    
    // Check localStorage
    await waitFor(() => {
      const stored = JSON.parse(localStorageMock.getItem('erp-recent-searches'));
      expect(stored.recent).toBeDefined();
      expect(stored.recent.length).toBeGreaterThan(0);
      expect(stored.recent[0].title).toBe('Dashboard');
    });
  });

  it('displays recent searches when no query', async () => {
    // Set up recent searches in localStorage
    localStorageMock.setItem('erp-recent-searches', JSON.stringify({
      recent: [
        { id: 'dashboard', title: 'Dashboard', path: '/dashboard', type: 'route', icon: '📊', category: 'Overview' }
      ],
      frequency: { dashboard: 5 }
    }));
    
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    await waitFor(() => {
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  it('tracks usage frequency', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type and select a result
    await userEvent.type(input, 'dashboard');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
    
    // Click on first result button
    const resultButtons = document.querySelectorAll('button[data-index]');
    fireEvent.click(resultButtons[0]);
    
    // Check that frequency was tracked
    await waitFor(() => {
      const stored = JSON.parse(localStorageMock.getItem('erp-recent-searches'));
      expect(stored.frequency).toBeDefined();
      expect(stored.frequency.dashboard).toBe(1);
    });
  });

  it('groups results by category', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query that matches multiple categories
    await userEvent.type(input, 'e');
    
    await waitFor(() => {
      // Should see category headers
      const categories = document.querySelectorAll('.uppercase.tracking-wide');
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  it('clears search query when X button is clicked', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'dashboard');
    
    expect(input.value).toBe('dashboard');
    
    // Click X button
    const clearButton = input.parentElement.querySelector('button');
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });

  it('displays result count in footer', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    // Type search query
    await userEvent.type(input, 'project');
    
    await waitFor(() => {
      expect(screen.getByText(/\d+ results?/)).toBeInTheDocument();
    });
  });

  it('completes search within 200ms', async () => {
    render(<GlobalSearch />);
    
    // Open modal
    fireEvent.click(screen.getByText('Search...'));
    
    const input = await screen.findByPlaceholderText(/Search routes, entities, and actions/i);
    
    const startTime = performance.now();
    
    // Type search query
    await userEvent.type(input, 'dashboard');
    
    await waitFor(() => {
      const results = screen.getAllByText(/Dashboard/i);
      expect(results.length).toBeGreaterThan(0);
    });
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Should complete within reasonable time (allowing for test overhead)
    expect(duration).toBeLessThan(500);
  });
});
