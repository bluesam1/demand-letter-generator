import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: (content: string) => Promise<void>;
  autoSaveInterval?: number; // milliseconds
  readOnly?: boolean;
}

const RichTextEditor = ({
  content,
  onChange,
  onSave,
  autoSaveInterval = 30000, // 30 seconds default
  readOnly = false,
}: RichTextEditorProps) => {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      CharacterCount,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHasChanges(true);
    },
  });

  // Auto-save effect
  useEffect(() => {
    if (!hasChanges || !onSave || !editor) {
      return;
    }

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const html = editor.getHTML();
        await onSave(html);
        setSaveStatus('saved');
        setLastSaved(new Date());
        setHasChanges(false);
      } catch (error) {
        setSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [hasChanges, onSave, autoSaveInterval, editor]);

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (onSave && editor) {
          setSaveStatus('saving');
          try {
            const html = editor.getHTML();
            await onSave(html);
            setSaveStatus('saved');
            setLastSaved(new Date());
            setHasChanges(false);
          } catch (error) {
            setSaveStatus('error');
            console.error('Manual save failed:', error);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, editor]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {!readOnly && <EditorToolbar editor={editor} />}

      <div className={`prose max-w-none p-6 min-h-[500px] ${readOnly ? 'bg-gray-50' : ''}`}>
        <EditorContent editor={editor} />
      </div>

      {!readOnly && (
        <EditorStatusBar editor={editor} saveStatus={saveStatus} lastSaved={lastSaved} />
      )}
    </div>
  );
};

export default RichTextEditor;
