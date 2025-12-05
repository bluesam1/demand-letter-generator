import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import EditorToolbar from './EditorToolbar';
import { Editor } from '@tiptap/react';

describe('EditorToolbar', () => {
  const createMockEditor = (): Partial<Editor> => {
    const mockChain = {
      focus: vi.fn().mockReturnThis(),
      toggleBold: vi.fn().mockReturnThis(),
      toggleItalic: vi.fn().mockReturnThis(),
      toggleUnderline: vi.fn().mockReturnThis(),
      toggleStrike: vi.fn().mockReturnThis(),
      toggleHeading: vi.fn().mockReturnThis(),
      setParagraph: vi.fn().mockReturnThis(),
      toggleBulletList: vi.fn().mockReturnThis(),
      toggleOrderedList: vi.fn().mockReturnThis(),
      setTextAlign: vi.fn().mockReturnThis(),
      toggleBlockquote: vi.fn().mockReturnThis(),
      setHorizontalRule: vi.fn().mockReturnThis(),
      setHardBreak: vi.fn().mockReturnThis(),
      undo: vi.fn().mockReturnThis(),
      redo: vi.fn().mockReturnThis(),
      run: vi.fn().mockReturnThis(),
    };

    return {
      chain: vi.fn(() => mockChain) as never,
      can: vi.fn(() => ({
        undo: () => true,
        redo: () => true,
      })) as never,
      isActive: vi.fn(() => false) as never,
    };
  };

  it('renders null when editor is null', () => {
    const { container } = render(<EditorToolbar editor={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all formatting buttons', () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    expect(screen.getByTitle(/Bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Italic/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Underline/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Strikethrough/i)).toBeInTheDocument();
  });

  it('renders heading buttons', () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    expect(screen.getByTitle('Heading 1')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 2')).toBeInTheDocument();
    expect(screen.getByTitle('Heading 3')).toBeInTheDocument();
  });

  it('renders list buttons', () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    expect(screen.getByTitle(/Bullet List/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Numbered List/i)).toBeInTheDocument();
  });

  it('renders alignment buttons', () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    expect(screen.getByTitle('Align Left')).toBeInTheDocument();
    expect(screen.getByTitle('Align Center')).toBeInTheDocument();
    expect(screen.getByTitle('Align Right')).toBeInTheDocument();
    expect(screen.getByTitle('Justify')).toBeInTheDocument();
  });

  it('renders undo/redo buttons', () => {
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    expect(screen.getByTitle(/Undo/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Redo/i)).toBeInTheDocument();
  });

  it('calls toggleBold when bold button is clicked', async () => {
    const user = userEvent.setup();
    const mockEditor = createMockEditor();
    render(<EditorToolbar editor={mockEditor as Editor} />);

    const boldButton = screen.getByTitle(/Bold/i);
    await user.click(boldButton);

    expect(mockEditor.chain).toHaveBeenCalled();
  });

  it('applies active state to active buttons', () => {
    const mockEditor = createMockEditor();
    mockEditor.isActive = vi.fn((format: string) => format === 'bold') as never;

    render(<EditorToolbar editor={mockEditor as Editor} />);

    const boldButton = screen.getByTitle(/Bold/i);
    expect(boldButton).toHaveClass('bg-gray-200');
  });
});
