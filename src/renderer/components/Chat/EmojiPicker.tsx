import React from 'react';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐',
  '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
  '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿',
  '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
  '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈',
  '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗', '💓', '💞',
  '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚', '💙', '💜',
  '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦', '💨', '💬',
  '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐️', '✋', '🖖', '👌',
  '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
  '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌',
  '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🔥', '⭐', '🌟', '✨',
  '💫', '💥', '💢', '💯', '💤', '💨', '👑', '💍', '💎', '🔔',
  '🔕', '🎵', '🎶', '🎤', '🎧', '📻', '🎷', '🎺', '🎸', '🥁',
  '🎹', '🎯', '🎲', '🎮', '🎰', '🎨', '🖼️', '🎭', '🎪', '🎬',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🚁', '✈️',
  '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛸', '🚤', '🛥️', '🛳️',
  '⛴️', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽',
  '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️',
  '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡',
  '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦',
  '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕',
  '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠',
  '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁',
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose }) => {
  return (
    <div className="mb-2 rounded-lg border border-border-color bg-panel p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Emoji</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          aria-label="Close emoji picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="flex gap-0.5 pb-1">
          {COMMON_EMOJIS.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              type="button"
              onClick={() => onEmojiSelect(emoji)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg transition-colors hover:bg-surface"
              aria-label={`Select ${emoji} emoji`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

