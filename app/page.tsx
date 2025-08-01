// app/page.tsx - Much simpler

import type { Metadata } from "next";
import { List } from "./components/List/List";
import { HomeCardList } from "./components/List/HomeCardList";
import { getAllArticleSlugs } from "./utils/server";

export const metadata: Metadata = {
  title: "Home | Z-Beam",
  description:
    "Welcome to Z-Beam's portfolio showcasing laser cleaning solutions for industrial applications.",
};

export default async function HomePage() {
  // Only fetch slugs once
  const slugs = await getAllArticleSlugs();

  return (
    <>
      {/* Hero section */}
      <section className="relative">
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Z-Beam Laser Cleaning
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl">
            Advanced surface treatment solutions for industrial applications
          </p>
        </div>
      </section>

      {/* HomeCardList */}
      <section className="container mx-auto px-4 py-8">
        <HomeCardList heading="Featured Solutions" className="mb-8" />
      </section>

      {/* Materials - Pass slugs and filter */}
      <section className="container mx-auto px-4 py-8">
        <List
          slugs={slugs}
          filterBy="material"
          heading="Material-Specific Solutions"
          columns={3}
        />
      </section>

      {/* Applications */}
      <section className="container mx-auto px-4 py-8">
        <List
          slugs={slugs}
          filterBy="application"
          heading="Applications & Techniques"
          columns={2}
        />
      </section>

      {/* All Articles */}
      <section className="container mx-auto px-4 py-12">
        <List
          slugs={slugs}
          filterBy="all"
          heading="All Solutions"
          columns={4}
        />
      </section>
    </>
  );
}
