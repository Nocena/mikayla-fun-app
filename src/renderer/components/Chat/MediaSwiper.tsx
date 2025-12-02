import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MessageMedia } from '../../types/chat';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MediaSwiperProps {
  media: MessageMedia[];
  hasTextBelow?: boolean;
  hasContentAbove?: boolean;
}

export const MediaSwiper: React.FC<MediaSwiperProps> = ({ media, hasTextBelow = false, hasContentAbove = false }) => {
  const [swiper, setSwiper] = React.useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handlePrev = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  if (media.length === 0) {
    return null;
  }

  // Determine rounded classes based on content above and below
  let roundedClasses = 'rounded-2xl';
  if (hasContentAbove && hasTextBelow) {
    roundedClasses = 'rounded-none'; // No rounding when sandwiched
  } else if (hasContentAbove) {
    roundedClasses = 'rounded-b-2xl rounded-t-none'; // Content above, nothing below
  } else if (hasTextBelow) {
    roundedClasses = 'rounded-t-2xl rounded-b-none'; // Content below, nothing above
  }
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex === media.length - 1;

  return (
    <div className={`relative w-full ${roundedClasses} overflow-hidden bg-surface`}>
      <Swiper
        modules={[Pagination]}
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
        <>
          <button
            onClick={handlePrev}
            disabled={isFirstSlide}
            className={`absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-black/80 ${
              isFirstSlide ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            disabled={isLastSlide}
            className={`absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-all hover:bg-black/80 ${
              isLastSlide ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white z-10 pointer-events-none">
            {activeIndex + 1} / {media.length}
          </div>
        </>
      )}
      <style>{`
        .swiper-pagination {
          display: none;
        }
      `}</style>
    </div>
  );
};

