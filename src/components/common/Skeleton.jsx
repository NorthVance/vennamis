import React from 'react';

export default function Skeleton({ view }) {
  const isGrid = view === 'gigs';
  const count = isGrid ? 6 : 3;
  const items = Array(count).fill(0);

  return (
    <div className={isGrid ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" : "flex flex-col space-y-4 sm:space-y-6 max-w-3xl mx-auto w-full"}>
      {items.map((_, idx) => (
        <div key={idx} className="bento-card rounded-[2rem] p-5 sm:p-6 h-[200px] sm:h-[220px] flex flex-col justify-between">
          <div className="flex flex-col h-full space-y-3">
            
            <div className="flex justify-between items-start">
              <div className="w-16 h-6 skeleton-shimmer rounded"></div>
              <div className="w-12 h-6 skeleton-shimmer rounded"></div>
            </div>
            
            <div className="w-3/4 h-5 skeleton-shimmer rounded mt-2"></div>
            <div className="w-full h-3 skeleton-shimmer rounded mt-2"></div>
            <div className="w-5/6 h-3 skeleton-shimmer rounded"></div>
            
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-[var(--border-line)]">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full skeleton-shimmer"></div>
                <div className="w-20 h-3 skeleton-shimmer rounded"></div>
              </div>
              <div className="w-12 h-4 skeleton-shimmer rounded"></div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
