"use client";

interface ChromeLabels {
  topLeft: string;
  topRight: string;
  bottomLeft?: string;
  bottomRight: string;
}

export function ChromeBar({ labels }: { labels: ChromeLabels }) {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="px-8 py-3 flex justify-between items-center">
          <span className="font-mono-alt text-[0.65rem] tracking-[0.15em] uppercase opacity-35">
            {labels.topLeft}
          </span>
          <span className="font-mono-alt text-[0.65rem] tracking-[0.15em] uppercase opacity-35">
            {labels.topRight}
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="px-8 py-3 flex justify-between items-center">
          <span className="font-mono-alt text-[0.65rem] tracking-[0.06em] opacity-25">
            {labels.bottomLeft}
          </span>
          <span className="font-mono-alt text-[0.65rem] tracking-[0.06em] opacity-25">
            {labels.bottomRight}
          </span>
        </div>
      </div>
    </>
  );
}
