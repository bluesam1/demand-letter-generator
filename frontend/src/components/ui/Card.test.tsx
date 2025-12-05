import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies medium padding by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('p-6');
  });

  it('applies different padding sizes', () => {
    const { rerender, container } = render(<Card padding="sm">Content</Card>);
    let card = container.firstChild;
    expect(card).toHaveClass('p-3');

    rerender(<Card padding="lg">Content</Card>);
    card = container.firstChild;
    expect(card).toHaveClass('p-8');
  });

  it('applies shadow correctly', () => {
    const { rerender, container } = render(<Card shadow="sm">Content</Card>);
    let card = container.firstChild;
    expect(card).toHaveClass('shadow-sm');

    rerender(<Card shadow="lg">Content</Card>);
    card = container.firstChild;
    expect(card).toHaveClass('shadow-lg');
  });
});

describe('CardHeader', () => {
  it('renders children correctly', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });
});

describe('CardTitle', () => {
  it('renders title correctly', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renders content correctly', () => {
    render(<CardContent>Main content</CardContent>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('renders footer correctly', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
