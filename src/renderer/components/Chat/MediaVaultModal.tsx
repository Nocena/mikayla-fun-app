import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';

export type MediaType = 'photo' | 'gif' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  dateLabel: string;
  thumbnailUrl: string;
}

export interface MediaCategory {
  id: string;
  name: string;
  count: number;
  items: MediaItem[];
}

export interface MediaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: MediaItem[]) => void;
}

const FILTER_TABS: Array<{ id: MediaType | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'photo', label: 'Photo' },
  { id: 'gif', label: 'GIF' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
];

const VAULT_DATA: MediaCategory[] = [
  {
    id: 'all',
    name: 'All media',
    count: 7,
    items: [
      {
        id: 'detective-1',
        type: 'photo',
        title: 'Detective portrait',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/1e1f2b/fff?text=Detective',
      },
      {
        id: 'monster-1',
        type: 'photo',
        title: 'Green monster',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/115c2d/fff?text=Monster',
      },
      {
        id: 'detective-2',
        type: 'photo',
        title: 'Detective profile',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/2c1f3b/fff?text=Detective+II',
      },
      {
        id: 'emoji-pack',
        type: 'gif',
        title: 'Emoji pack',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/1a4a73/fff?text=Emoji',
      },
      {
        id: 'components',
        type: 'photo',
        title: 'Blue components',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/0f3f6d/fff?text=Components',
      },
      {
        id: 'drone',
        type: 'video',
        title: 'Drone render',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/1f1f1f/fff?text=Drone',
      },
      {
        id: 'android',
        type: 'video',
        title: 'Android test',
        dateLabel: 'Yesterday',
        thumbnailUrl: 'https://placehold.co/400x400/050505/fff?text=Android',
      },
    ],
  },
  {
    id: 'stories',
    name: 'Stories',
    count: 0,
    items: [],
  },
  {
    id: 'posts',
    name: 'Posts',
    count: 3,
    items: [],
  },
  {
    id: 'streams',
    name: 'Streams',
    count: 0,
    items: [],
  },
  {
    id: 'uploads',
    name: 'Uploads',
    count: 0,
    items: [],
  },
  {
    id: 'boobs',
    name: 'boobs',
    count: 3,
    items: [],
  },
  {
    id: 'messages',
    name: 'Messages',
    count: 4,
    items: [],
  },
];

const MAX_SELECTION = 40;

export const MediaVaultModal = ({ isOpen, onClose, onAdd }: MediaVaultModalProps) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(VAULT_DATA[0].id);
  const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const selectedCategory = useMemo(
    () => VAULT_DATA.find((category) => category.id === selectedCategoryId) ?? VAULT_DATA[0],
    [selectedCategoryId],
  );

  const itemsById = useMemo(() => {
    const map = new Map<string, MediaItem>();
    VAULT_DATA.forEach((category) => {
      category.items.forEach((item) => map.set(item.id, item));
    });
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') {
      return selectedCategory.items;
    }
    return selectedCategory.items.filter((item) => item.type === activeFilter);
  }, [activeFilter, selectedCategory.items]);

  if (!isOpen) {
    return null;
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else if (next.size < MAX_SELECTION) {
        next.add(itemId);
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedItemIds(new Set());

  const handleAdd = () => {
    const selectedItems: MediaItem[] = [];
    selectedItemIds.forEach((id) => {
      const item = itemsById.get(id);
      if (item) {
        selectedItems.push(item);
      }
    });
    onAdd(selectedItems);
    clearSelection();
  };

  const selectedCount = selectedItemIds.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
      <div className="relative flex w-full max-w-5xl gap-6 rounded-2xl border border-border-color bg-panel p-6 text-text-primary shadow-2xl">
        <button
          type="button"
          onClick={() => {
            clearSelection();
            onClose();
          }}
          className="absolute right-3 top-3 rounded-full border border-border-color p-1.5 text-text-secondary transition hover:border-primary hover:text-primary"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <aside className="w-60 border-r border-border-color pr-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Vault</div>
          <div className="mt-4 space-y-1 text-sm">
            {VAULT_DATA.map((category) => {
              const isActive = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                    isActive ? 'bg-surface text-primary' : 'text-text-secondary hover:bg-surface/60'
                  }`}
                >
                  <span>{category.name}</span>
                  {category.count > 0 && (
                    <span className="rounded-full bg-border-color px-2 text-xs text-text-secondary">
                      {category.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-1 flex-col">
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center rounded-full border border-border-color bg-surface px-3 py-2 text-sm text-text-secondary">
              <input
                type="search"
                placeholder="Search"
                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-full border px-3 py-1 transition-colors ${
                    activeFilter === tab.id
                      ? 'border-primary text-primary'
                      : 'border-border-color hover:border-primary/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto">
            {selectedCategory.items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-text-muted">
                <p className="text-sm font-medium">Empty</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-text-muted">
                <p className="text-sm font-medium">No media found for this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {filteredItems.map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItemSelection(item.id)}
                      className={`relative aspect-square overflow-hidden rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-border-color hover:border-primary/40'
                      }`}
                    >
                      <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {item.dateLabel}
                      </span>
                      {isSelected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-full border border-border-color bg-surface px-4 py-2 text-sm font-semibold uppercase tracking-wide">
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1 text-text-secondary transition hover:text-primary"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
            <span className="text-text-secondary">
              {selectedCount} / {MAX_SELECTION} Selected
            </span>
            <button
              type="button"
              onClick={() => {
                handleAdd();
                onClose();
              }}
              className={`rounded-full bg-primary px-6 py-1 text-white transition hover:bg-primary/80 ${
                selectedCount === 0 ? 'opacity-60' : ''
              }`}
            >
              Add
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

