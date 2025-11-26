import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { X, Plus } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

export interface AttachedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface MediaAttachmentBarProps {
  files: AttachedFile[];
  onRemove: (id: string) => void;
  onAdd: () => void;
}

const SUPPORTED_EXTENSIONS = [
  'jpg', 'jpeg', 'gif', 'png', 'heic',
  'mp4', 'mov', 'moov', 'm4v', 'mpg', 'mpeg', 'wmv', 'avi', 'webm', 'mkv',
  'mp3', 'wav', 'ogg'
];

export const isSupportedFile = (file: File): boolean => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_EXTENSIONS.includes(extension) : false;
};

export const MediaAttachmentBar: React.FC<MediaAttachmentBarProps> = ({
  files,
  onRemove,
  onAdd,
}) => {
  const swiperRef = useRef<any>(null);

  if (files.length === 0) {
    return null;
  }

  const showNavigation = files.length > 3;

  return (
    <div className="mb-2 rounded-lg border border-border-color bg-panel p-2">
      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        navigation={showNavigation}
        slidesPerView="auto"
        spaceBetween={8}
        className="!px-0"
      >
        {files.map((file) => (
          <SwiperSlide key={file.id} className="!w-20">
            <div className="relative aspect-square w-20 overflow-hidden rounded-lg bg-surface">
              {file.file.type.startsWith('image/') ? (
                <img
                  src={file.previewUrl}
                  alt={file.file.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface">
                  <span className="text-xs text-text-secondary">
                    {file.file.type.startsWith('video/') ? '🎥' : '🎵'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(file.id)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
                aria-label="Remove file"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </SwiperSlide>
        ))}
        <SwiperSlide className="!w-20">
          <button
            type="button"
            onClick={onAdd}
            className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-border-color bg-surface text-text-secondary transition-colors hover:border-primary hover:text-primary"
            aria-label="Add more files"
          >
            <Plus className="h-6 w-6" />
          </button>
        </SwiperSlide>
      </Swiper>
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: var(--text-secondary);
          background: rgba(0, 0, 0, 0.1);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.2);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 12px;
          font-weight: 700;
        }
        .swiper-button-next {
          right: 0;
        }
        .swiper-button-prev {
          left: 0;
        }
      `}</style>
    </div>
  );
};

