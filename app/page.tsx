// app/page.tsx
import { MaterialList } from "@/app/components/List/MaterialList";
import type { Metadata } from "next";
import { HomeCardList } from "./components/List/HomeCardList";
import { VimeoPlayer } from "./components/Video/VimeoPlayer";

export const metadata: Metadata = {
  title: "Home | Z-Beam",
  description:
    "Welcome to Z-Beam's portfolio showcasing laser cleaning solutions for industrial applications.",
};

export default function HomePage() {
  return (
    <>
      {/* Hero section with video background and content */}
      <section className="relative">
        {/* Video background */}
        <VimeoPlayer
          videoId="1058778534"
          autoPlay={true}
          controls={false}
          loop={true}
          background={true}
          height="h-[50vh]" // Set explicit height
          className="mb-0" // Remove bottom margin
        />

        {/* Content overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Z-Beam Laser Cleaning
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Advanced surface treatment solutions for industrial applications
          </p>
        </div>
      </section>

      {/* Cards section */}
      <section className="container mx-auto px-4 py-4">
        <HomeCardList />
      </section>
    </>
  );
}
