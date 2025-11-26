import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { X, Plus } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

export type UploadStatus = 'pending' | 'uploading' | 'converting' | 'completed' | 'error';

export type AttachmentType = 'uploaded' | 'vault';

export interface AttachedFile {
  id: string;
  type: AttachmentType;
  // For uploaded files
  file?: File;
  previewUrl?: string;
  uploadStatus?: UploadStatus;
  uploadProgress?: number;
  uploadError?: string;
  uploadResult?: {
    sourceUrl: string;
    processId: string;
    extra: string;
    host: string;
  };
  // For vault media
  vaultImageId?: string;
  thumbnailUrl?: string;
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
        {files.map((file) => {
          const imageUrl = file.type === 'vault' 
            ? file.thumbnailUrl 
            : (file.uploadResult?.sourceUrl || file.previewUrl);
          const isImage = file.type === 'vault' 
            ? !!file.thumbnailUrl
            : (file.file?.type.startsWith('image/') ?? false);
          const isVideo = file.type === 'uploaded' && file.file?.type.startsWith('video/');
          const isAudio = file.type === 'uploaded' && file.file?.type.startsWith('audio/');
          const displayName = file.type === 'vault' 
            ? 'Vault media' 
            : (file.file?.name || 'Unknown');

          return (
            <SwiperSlide key={file.id} className="!w-20">
              <div className="relative aspect-square w-20 overflow-hidden rounded-lg bg-surface">
                {isImage && imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface">
                    <span className="text-xs text-text-secondary">
                      {isVideo ? '🎥' : isAudio ? '🎵' : '📄'}
                    </span>
                  </div>
                )}
                {(file.uploadStatus === 'uploading' || file.uploadStatus === 'converting') && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{
                        width: `${file.uploadProgress || 0}%`,
                      }}
                    />
                  </div>
                )}
                {file.uploadStatus === 'error' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/90 p-1">
                    <span className="text-xs font-medium text-white text-center">Error</span>
                    {file.uploadError && (
                      <span className="text-[10px] text-white/90 text-center mt-0.5 line-clamp-2">
                        {file.uploadError}
                      </span>
                    )}
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
          );
        })}
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

