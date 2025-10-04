// app/services/page.tsx
import { Layout } from "../components/Layout/Layout";
import { Title } from "../components/Title";
import { SITE_CONFIG } from "../utils/constants";

// Force static generation for services page
export const dynamic = 'force-static';
export const revalidate = false; // Never revalidate in production

export const metadata = {
  title: `Services | ${SITE_CONFIG.name}`,
  description: `Explore ${SITE_CONFIG.shortName}'s comprehensive laser cleaning services, including surface preparation, oxide removal, coating removal, and customized industrial cleaning solutions.`
};

// Default export - the page component using standard Layout pattern
export default async function ServicesPage() {
  return (
    <Layout
      title={`${SITE_CONFIG.shortName} Laser Cleaning Services`}
      description="Comprehensive laser cleaning services for industrial applications, including surface preparation, oxide removal, coating removal, and customized cleaning solutions."
      showHero={false}
    >
      <div className="space-y-8">
        <section>
          <Title level="section" title="Our Services" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Surface Preparation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Professional laser cleaning for optimal surface preparation across various materials and industries.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Oxide Removal</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Efficient removal of oxidation from metals without damaging the substrate material.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Coating Removal</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Selective removal of coatings, paints, and other surface treatments with precision control.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Custom Solutions</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Tailored laser cleaning solutions designed to meet specific industrial requirements.
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <Title level="section" title="Industries We Serve" />
          
          <ul className="mt-6 space-y-4">
            <li className="flex items-start">
              <span className="font-semibold mr-2">Automotive:</span>
              <span className="text-gray-600 dark:text-gray-300">Paint removal, surface preparation for welding</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">Aerospace:</span>
              <span className="text-gray-600 dark:text-gray-300">Precision cleaning of critical components</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">Manufacturing:</span>
              <span className="text-gray-600 dark:text-gray-300">General surface preparation and cleaning</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">Restoration:</span>
              <span className="text-gray-600 dark:text-gray-300">Heritage building and artifact cleaning</span>
            </li>
          </ul>
        </section>
        
        <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Title level="section" title="Contact Us" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ready to explore how {SITE_CONFIG.shortName} laser cleaning can benefit your operations? Contact our team for a consultation.
          </p>
        </section>
      </div>
    </Layout>
  );
}
