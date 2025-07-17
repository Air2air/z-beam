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
  flush?: boolean;
  background?: boolean;
  height?: string; // Add height prop
}

export function VimeoPlayer({
  videoId,
  title = "Video Player",
  aspectRatio = "16:9",
  autoPlay = false,
  controls = true,
  loop = false,
  className = "",
  flush = false,
  background = false,
  height = "auto", // Default to auto
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
    autoplay: autoPlay || background ? "1" : "0",
    loop: loop || background ? "1" : "0",
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
  });

  if (background) {
    params.append("controls", "0");
    params.append("background", "1");
    params.append("muted", "1");
  } else if (!controls) {
    params.append("controls", "0");
  }

  const vimeoUrl = `https://player.vimeo.com/video/${videoId}?${params.toString()}`;

  return (
    <div
      className={cn(
        "w-full",
        // For background videos, use relative positioning with defined height
        background
          ? `relative overflow-hidden ${height !== "auto" ? height : "h-[50vh]"}`
          : "relative",
        flush ? "m-0 p-0" : "my-0 p-0",
        // Only use aspect ratio for regular videos
        background ? "" : aspectRatioClass,
        className
      )}
    >
      <iframe
        src={vimeoUrl}
        className={cn(
          "absolute",
          background
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[100%] min-h-[100%] w-auto h-auto"
            : "top-0 left-0 w-full h-full",
          flush || background ? "" : "rounded-lg shadow-md"
        )}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={background ? "" : title}
      ></iframe>

      {/* Optional overlay for background videos */}
      {background && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      )}
    </div>
  );
}
