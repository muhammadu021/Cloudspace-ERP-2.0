/**
 * Breadcrumbs Component Tests
 * 
 * Tests for the Breadcrumbs navigation component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Breadcrumbs', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders nothing on home/dashboard route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders breadcrumbs for nested route', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });

  it('renders breadcrumbs with ID segments', () => {
    render(
      <MemoryRouter initialEntries={['/projects/123/edit']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('navigates when clicking parent breadcrumb', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const homeButton = screen.getByLabelText('Navigate to Home');
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('does not navigate when clicking current page breadcrumb', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const currentPage = screen.getByText('List');
    fireEvent.click(currentPage);
    
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation with Enter key', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const projectsButton = screen.getByLabelText('Navigate to Projects');
    fireEvent.keyDown(projectsButton, { key: 'Enter' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('supports keyboard navigation with Space key', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const projectsButton = screen.getByLabelText('Navigate to Projects');
    fireEvent.keyDown(projectsButton, { key: ' ' });
    
    expect(mockNavigate).toHaveBeenCalledWith('/projects');
  });

  it('marks current page with aria-current', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    // Find the span element that contains the text and has aria-current
    const currentPage = screen.getByText('List').parentElement;
    expect(currentPage).toHaveAttribute('aria-current', 'page');
  });

  it('renders with proper ARIA labels', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();
  });

  it('uses route label mappings correctly', () => {
    render(
      <MemoryRouter initialEntries={['/hr/employees']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
  });

  it('capitalizes unmapped route segments', () => {
    render(
      <MemoryRouter initialEntries={['/custom/unmapped-route']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Custom')).toBeInTheDocument();
    expect(screen.getByText('Unmapped route')).toBeInTheDocument();
  });

  it('handles deep nested routes', () => {
    render(
      <MemoryRouter initialEntries={['/hr/employees/123/edit']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('HR')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('#123')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs className="custom-class" />
      </MemoryRouter>
    );
    
    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-class');
  });

  it('renders Home icon for first breadcrumb', () => {
    render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    const homeButton = screen.getByLabelText('Navigate to Home');
    const svg = homeButton.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders chevron separators between breadcrumbs', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/projects/list']}>
        <Breadcrumbs />
      </MemoryRouter>
    );
    
    // Should have 2 chevrons (between Home-Projects and Projects-List)
    const chevrons = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(chevrons.length).toBeGreaterThan(0);
  });
});
