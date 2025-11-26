import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { useWebviews } from '../../contexts/WebviewContext';
import { filterAllowedHeaders } from '../../services/onlyfansChatsService';
import {
  getVaultListsScript,
  getVaultMediaScript,
  OnlyFansVaultListsResponse,
  OnlyFansVaultMediaResponse,
} from '../../services/onlyfansVaultService';

export type MediaType = 'photo' | 'gif' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  type: MediaType;
  createdAt: string;
  thumbnailUrl: string;
}

interface MediaCategory {
  id: string;
  name: string;
  count: number;
}

export interface MediaVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (items: MediaItem[]) => void;
  accountId?: string;
  accountPlatform?: string;
  accountUserId?: string | null;
}

const FILTER_TABS: Array<{ id: MediaType | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'photo', label: 'Photo' },
  { id: 'gif', label: 'GIF' },
  { id: 'video', label: 'Video' },
  { id: 'audio', label: 'Audio' },
];

const MAX_SELECTION = 40;

const countMediaTotal = (counts?: {
  videosCount?: number;
  photosCount?: number;
  gifsCount?: number;
  audiosCount?: number;
}) =>
  (counts?.videosCount ?? 0) +
  (counts?.photosCount ?? 0) +
  (counts?.gifsCount ?? 0) +
  (counts?.audiosCount ?? 0);

const normalizeCategories = (data: OnlyFansVaultListsResponse | null): MediaCategory[] => {
  if (!data) return [];
  const categories: MediaCategory[] = [];

  categories.push({
    id: 'all',
    name: 'All media',
    count: countMediaTotal(data.all) || 0,
  });

  (data.list || []).forEach((item) => {
    categories.push({
      id: item.id.toString(),
      name: item.name,
      count: countMediaTotal(item),
    });
  });

  return categories;
};

const mapMediaItems = (response: OnlyFansVaultMediaResponse | null): MediaItem[] => {
  if (!response?.list) return [];
  return response.list
    .map((media) => ({
      id: media.id.toString(),
      type: media.type,
      createdAt: media.createdAt,
      thumbnailUrl:
        media.files?.thumb?.url ||
        media.files?.preview?.url ||
        media.files?.squarePreview?.url ||
        media.files?.full?.url ||
        '',
    }))
    .filter((item) => item.thumbnailUrl);
};

const formatDateLabel = (isoString: string) => {
  if (!isoString) return '';
  const createdDate = new Date(isoString);
  const now = new Date();

  const sameDay =
    createdDate.getFullYear() === now.getFullYear() &&
    createdDate.getMonth() === now.getMonth() &&
    createdDate.getDate() === now.getDate();

  if (sameDay) {
    return createdDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    createdDate.getFullYear() === yesterday.getFullYear() &&
    createdDate.getMonth() === yesterday.getMonth() &&
    createdDate.getDate() === yesterday.getDate();

  if (isYesterday) {
    return 'Yesterday';
  }

  const datePart = createdDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const timePart = createdDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${datePart} • ${timePart}`;
};

export const MediaVaultModal = ({
  isOpen,
  onClose,
  onAdd,
  accountId,
  accountPlatform,
  accountUserId,
}: MediaVaultModalProps) => {
  const { webviewRefs } = useWebviews();
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<MediaType | 'all'>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [itemsByCategory, setItemsByCategory] = useState<Record<string, MediaItem[]>>({});
  const [itemLookup, setItemLookup] = useState<Record<string, MediaItem>>({});
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountReady = Boolean(accountId && accountPlatform && accountUserId);
  const partitionName = accountReady ? `persist:${accountPlatform}-${accountId}` : null;

  useEffect(() => {
    if (!isOpen) {
      setCategories([]);
      setItemsByCategory({});
      setItemLookup({});
      setSelectedItemIds(new Set());
      setActiveFilter('all');
      setError(null);
      setSelectedCategoryId('all');
      return;
    }
  }, [isOpen]);

  const getAllowedHeaders = useCallback(async () => {
    if (!partitionName) {
      throw new Error('Missing OnlyFans session headers');
    }
    const hdrRes = await window.electronAPI.headers.get(partitionName);
    const rawHeaders = hdrRes.success && hdrRes.data ? hdrRes.data : {};
    const allowedHeaders = filterAllowedHeaders(rawHeaders);
    if (Object.keys(allowedHeaders).length === 0) {
      throw new Error('Missing authentication headers for OnlyFans account');
    }
    return allowedHeaders;
  }, [partitionName]);

  const fetchVaultLists = useCallback(async () => {
    if (!accountReady || !accountId || !accountUserId) {
      throw new Error('Select an OnlyFans account to load the vault');
    }
    const ref = webviewRefs.current[accountId];
    if (!ref) {
      throw new Error('OnlyFans browser session is not ready yet');
    }
    const headers = await getAllowedHeaders();
    const script = getVaultListsScript(headers, accountUserId);
    const response = await ref.executeScript(script);
    if (!response?.ok || !response.data) {
      throw new Error('Unable to load vault lists');
    }
    return response.data as OnlyFansVaultListsResponse;
  }, [accountReady, accountId, accountUserId, getAllowedHeaders, webviewRefs]);

  const fetchVaultMedia = useCallback(
    async (listId: string) => {
      if (!accountReady || !accountId || !accountUserId) {
        throw new Error('Select an OnlyFans account to load media');
      }
      const ref = webviewRefs.current[accountId];
      if (!ref) {
        throw new Error('OnlyFans browser session is not ready yet');
      }
      const headers = await getAllowedHeaders();
      const script = getVaultMediaScript(headers, accountUserId, { list: listId });
      const response = await ref.executeScript(script);
      if (!response?.ok || !response.data) {
        throw new Error('Unable to load media for this category');
      }
      return response.data as OnlyFansVaultMediaResponse;
    },
    [accountReady, accountId, accountUserId, getAllowedHeaders, webviewRefs],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!accountReady) {
      setError('Connect an OnlyFans account to view the media vault.');
      return;
    }

    let cancelled = false;
    setLoadingLists(true);
    setError(null);

    const load = async () => {
      try {
        const data = await fetchVaultLists();
        if (cancelled) return;
        const normalized = normalizeCategories(data);
        setCategories(normalized);
        setSelectedCategoryId(normalized[0]?.id ?? 'all');
        setItemsByCategory({});
        setItemLookup({});
        setSelectedItemIds(new Set());
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load media vault');
        }
      } finally {
        if (!cancelled) {
          setLoadingLists(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isOpen, accountReady, fetchVaultLists]);

  useEffect(() => {
    if (!isOpen || !accountReady) return;
    if (!selectedCategoryId) return;
    if (itemsByCategory[selectedCategoryId]) return;

    let cancelled = false;
    setError(null);
    setLoadingMedia(true);

    const loadMedia = async () => {
      try {
        const data = await fetchVaultMedia(selectedCategoryId);
        if (cancelled) return;
        const mapped = mapMediaItems(data);
        setItemsByCategory((prev) => ({
          ...prev,
          [selectedCategoryId]: mapped,
        }));
        setItemLookup((prev) => {
          const next = { ...prev };
          mapped.forEach((item) => {
            next[item.id] = item;
          });
          return next;
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load media');
        }
      } finally {
        if (!cancelled) {
          setLoadingMedia(false);
        }
      }
    };

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [isOpen, accountReady, selectedCategoryId, itemsByCategory, fetchVaultMedia]);

  const currentItems = itemsByCategory[selectedCategoryId] ?? [];
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return currentItems;
    return currentItems.filter((item) => item.type === activeFilter);
  }, [activeFilter, currentItems]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveFilter('all');
  }, [selectedCategoryId, isOpen]);

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
      const item = itemLookup[id];
      if (item) {
        selectedItems.push(item);
      }
    });
    onAdd(selectedItems);
    clearSelection();
  };

  const selectedCount = selectedItemIds.size;
  const shouldShowEmpty = !loadingMedia && currentItems.length === 0;
  const shouldShowFilterEmpty = !loadingMedia && currentItems.length > 0 && filteredItems.length === 0;

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
            {categories.map((category) => {
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
                disabled
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

          <div className="relative mt-4 flex-1 overflow-y-auto">
            {(loadingLists || loadingMedia) && (
              <div className="absolute inset-0 flex items-center justify-center bg-panel/80">
                <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
              </div>
            )}
            {error && !loadingLists ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-text-muted">
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : shouldShowEmpty ? (
              <div className="flex h-full flex-col items-center justify-center text-text-muted">
                <p className="text-sm font-medium">Empty</p>
              </div>
            ) : shouldShowFilterEmpty ? (
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
                      <img
                        src={item.thumbnailUrl}
                        alt={`${item.type} media`}
                        className="h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {formatDateLabel(item.createdAt)}
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
              disabled={selectedCount === 0}
              onClick={() => {
                handleAdd();
                onClose();
              }}
              className={`rounded-full bg-primary px-6 py-1 text-white transition hover:bg-primary/80 ${
                selectedCount === 0 ? 'cursor-not-allowed opacity-60' : ''
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

