"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string; alt: string };

export function ProductGallery({ images, name }: { images: Img[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-cream-dark">
        {current && (
          <Image
            src={current.url}
            alt={current.alt || name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2",
                i === active
                  ? "border-vine-600"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`${name} ${i + 1}`}
            >
              <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
