import { Editor } from '@tiptap/react';

interface EditorStatusBarProps {
  editor: Editor | null;
  saveStatus: 'saved' | 'saving' | 'error';
  lastSaved: Date | null;
}

const EditorStatusBar = ({ editor, saveStatus, lastSaved }: EditorStatusBarProps) => {
  if (!editor) {
    return null;
  }

  const { characters, words } = editor.storage.characterCount || { characters: 0, words: 0 };

  const getTimeSince = (date: Date | null): string => {
    if (!date) return 'Never';

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case 'saved':
        return (
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      case 'saved':
        return `Saved ${getTimeSince(lastSaved)}`;
    }
  };

  return (
    <div className="border-t border-gray-300 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          {getSaveStatusIcon()}
          <span>{getSaveStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <span className="font-medium">{words}</span> words
        </div>
        <div>
          <span className="font-medium">{characters}</span> characters
        </div>
      </div>
    </div>
  );
};

export default EditorStatusBar;
