// app/components/Video/VimeoPlayer.tsx
"use client";

import { useState, useEffect } from "react";
import { cn } from "../../utils/helpers";

interface VimeoPlayerProps {
  videoId: string;
  title?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1";
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  className?: string;
}

export function VimeoPlayer({
  videoId,
  title = "Video Player",
  aspectRatio = "16:9",
  autoPlay = false,
  controls = true,
  loop = false,
  className = "",
}: VimeoPlayerProps) {
  const [aspectRatioClass, setAspectRatioClass] = useState("pb-[56.25%]"); // Default 16:9

  useEffect(() => {
    switch (aspectRatio) {
      case "4:3":
        setAspectRatioClass("pb-[75%]");
        break;
      case "1:1":
        setAspectRatioClass("pb-[100%]");
        break;
      default:
        setAspectRatioClass("pb-[56.25%]");
    }
  }, [aspectRatio]);

  // Build URL parameters
  const params = new URLSearchParams({
    autoplay: autoPlay ? "1" : "0",
    loop: loop ? "1" : "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });

  if (!controls) {
    params.append("controls", "0");
  }

  const vimeoUrl = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

  return (
    <div className={cn("relative w-full", aspectRatioClass)}>
      <iframe
        src={vimeoUrl}
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      ></iframe>
    </div>
  );
}
