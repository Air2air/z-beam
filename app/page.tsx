// app/page.tsx
import { MaterialList } from "@/app/components/List/MaterialList";
import type { Metadata } from "next";
import { HomeCardList } from "./components/List/HomeCardList";
import { VimeoPlayer } from "./components/Video/VimeoPlayer";

export const metadata: Metadata = {
  title: "Home | Z-Beam",
  description:
    "Welcome to Z-Beam's portfolio showcasing projects and materials on web development, Vim, and more.",
};

export default function HomePage() {
  return (
    <>
      <VimeoPlayer
        videoId="1058778534"
        aspectRatio="16:9"
        className="mb-12"
        autoPlay={true}
        controls={false}
        loop={true}
        priority={true}
        background={true}
      />
      <HomeCardList />
    </>
  );
}
