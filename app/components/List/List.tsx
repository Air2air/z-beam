// app/page.tsx - Multiple filtered sections
import { UnifiedList } from './components/List/UnifiedList';

export default async function HomePage() {
  // ... fetch articles as above ...

  return (
    <>
      {/* Hero and Cards sections */}
      
      {/* Featured Materials */}
      <section className="container mx-auto px-4 py-8">
        <UnifiedList
          items={articles}
          heading="Material-Specific Solutions"
          description="Laser cleaning solutions tailored for specific materials"
          layout="grid"
          columns={3}
          gap="md"
          cardVariant="outline"
          showBadges={true}
          filterBy={{ articleType: "material" }}
          sortBy="title"
          limit={6}
        />
      </section>

      {/* Applications */}
      <section className="container mx-auto px-4 py-8">
        <UnifiedList
          items={articles}
          heading="Applications & Techniques"
          description="Discover various laser cleaning applications and methodologies"
          layout="grid"
          columns={2}
          gap="lg"
          cardVariant="default"
          showBadges={true}
          filterBy={{ articleType: "application" }}
          sortBy="category"
          limit={4}
        />
      </section>

      {/* All Articles */}
      <section className="container mx-auto px-4 py-12">
        <UnifiedList
          items={articles}
          heading="All Solutions"
          description="Browse our complete library of laser cleaning technologies"
          layout="grid"
          columns={4}
          gap="md"
          cardVariant="subtle"
          showBadges={true}
          sortBy="title"
        />
      </section>
    </>
  );
}