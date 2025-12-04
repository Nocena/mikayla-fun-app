import type { LucideIcon } from 'lucide-react';
import {
  Image as ImageIcon,
  Video,
  Mic,
  Music2,
  Clock3,
  Lock,
  DollarSign,
  FileText,
  Smile,
  Paperclip,
} from 'lucide-react';

type ToolbarAction = {
  key: string;
  label: string;
  Icon: LucideIcon;
  tooltip: string;
  disabled?: boolean;
};

export interface MessageToolbarProps {
  characterCount: number;
  onActionClick?: (actionKey: string) => void;
  activeAction?: string;
  disabled?: boolean;
}

const MESSAGE_TOOLBAR_ACTIONS: ToolbarAction[] = [
  {
    key: 'attach',
    label: 'Attach',
    Icon: Paperclip,
    tooltip: 'Attach files from computer',
  },
  {
    key: 'media',
    label: 'Media',
    Icon: ImageIcon,
    tooltip: 'Attach Media',
  },
  {
    key: 'video',
    label: 'Video',
    Icon: Video,
    tooltip: 'Attach videos up to 2 minutes',
    disabled: true,
  },
  {
    key: 'voice',
    label: 'Voice',
    Icon: Mic,
    tooltip: 'Record a new voice message (coming soon)',
    disabled: true,
  },
  {
    key: 'audio',
    label: 'Audio',
    Icon: Music2,
    tooltip: 'Attach audio clips (coming soon)',
    disabled: true,
  },
  {
    key: 'schedule',
    label: 'Schedule',
    Icon: Clock3,
    tooltip: 'Schedule message delivery (coming soon)',
    disabled: true,
  },
  {
    key: 'ppv',
    label: 'Price Lock',
    Icon: Lock,
    tooltip: 'Send PPV locked content (coming soon)',
  },
  {
    key: 'tip',
    label: 'Request Tip',
    Icon: DollarSign,
    tooltip: 'Request a tip from the fan',
    disabled: true,
  },
  {
    key: 'templates',
    label: 'Templates',
    Icon: FileText,
    tooltip: 'Insert saved templates (coming soon)',
    disabled: true,
  },
  {
    key: 'emoji',
    label: 'Emoji',
    Icon: Smile,
    tooltip: 'Open emoji picker',
  },
];

export const MessageToolbar = ({ characterCount, onActionClick, activeAction, disabled = false }: MessageToolbarProps) => {
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {MESSAGE_TOOLBAR_ACTIONS.map((action) => {
          const isActive = activeAction === action.key;
          const isDisabled = disabled || action.disabled;
          return (
            <button
              key={action.key}
              type="button"
              className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                isDisabled
                  ? 'cursor-not-allowed opacity-40 border-border-color bg-panel text-text-secondary'
                  : isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-color bg-panel text-text-secondary hover:border-primary hover:text-primary'
              }`}
              title={action.tooltip}
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled && onActionClick) {
                  onActionClick(action.key);
                }
              }}
            >
              <action.Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}
      </div>
      <div className="text-right text-xs text-text-secondary">{characterCount} characters</div>
    </div>
  );
};