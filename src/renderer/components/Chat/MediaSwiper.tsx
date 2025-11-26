import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { MessageMedia } from '../../types/chat';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MediaSwiperProps {
  media: MessageMedia[];
  hasTextBelow?: boolean;
}

export const MediaSwiper: React.FC<MediaSwiperProps> = ({ media, hasTextBelow = false }) => {
  const [swiper, setSwiper] = React.useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (media.length === 0) {
    return null;
  }

  const roundedClasses = hasTextBelow ? 'rounded-t-2xl' : 'rounded-2xl';

  return (
    <div className={`relative w-full ${roundedClasses} overflow-hidden bg-surface`}>
      <Swiper
        modules={[Navigation, Pagination]}
        navigation={media.length > 1}
        pagination={{
          clickable: false,
          renderBullet: (index, className) => {
            return `<span class="${className}" style="display: none;"></span>`;
          },
        }}
        onSwiper={setSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="aspect-square"
      >
        {media.map((item) => (
          <SwiperSlide key={item.id}>
            <img
              src={item.thumbnailUrl}
              alt={`Media ${item.id}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white z-10 pointer-events-none">
          {activeIndex + 1} / {media.length}
        </div>
      )}
      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white;
          background: rgba(0, 0, 0, 0.5);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: rgba(0, 0, 0, 0.7);
        }
        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 12px;
          font-weight: 700;
        }
        .swiper-button-next {
          right: 8px;
        }
        .swiper-button-prev {
          left: 8px;
        }
        .swiper-pagination {
          display: none;
        }
      `}</style>
    </div>
  );
};

