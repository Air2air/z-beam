// app/safety/page.tsx
import { Layout } from "../components/Layout/Layout";
import { MaterialJsonLD } from '../components/JsonLD/JsonLD';
import { loadPageData } from '../utils/contentAPI';
import { ArticleMetadata } from '@/types';
import { SITE_CONFIG } from '../utils/constants';
import { SectionContainer } from '../components/SectionContainer';
import { AlertTriangleIcon, ShieldIcon, CheckCircleIcon, PhoneIcon } from '@/app/components/Buttons';

export const metadata = {
  title: 'Laser Cleaning Safety Guidelines - Z-Beam',
  description: 'Comprehensive safety protocols, hazard information, and best practices for industrial laser cleaning operations. Learn about PPE requirements, ventilation systems, and material-specific safety considerations.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: `${SITE_CONFIG.url}/safety`,
  },
  openGraph: {
    title: 'Laser Cleaning Safety Guidelines - Z-Beam',
    description: 'Comprehensive safety protocols, hazard information, and best practices for industrial laser cleaning operations.',
    url: `${SITE_CONFIG.url}/safety`,
    siteName: SITE_CONFIG.name,
    type: 'website',
    images: [
      {
        url: `${SITE_CONFIG.url}/images/og-safety.jpg`,
        width: 1200,
        height: 630,
        alt: 'Laser Cleaning Safety Guidelines',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laser Cleaning Safety Guidelines - Z-Beam',
    description: 'Comprehensive safety protocols and best practices for industrial laser cleaning.',
  },
};

export default async function SafetyPage() {
  const { metadata: pageMetadata } = await loadPageData('contact');
  
  return (
    <>
      <MaterialJsonLD article={{ metadata: pageMetadata }} slug="safety" />
      <Layout
        title="Laser Cleaning Safety Guidelines"
        subtitle="Professional safety protocols and best practices for industrial laser cleaning operations"
        rightContent={null}
        metadata={pageMetadata as unknown as ArticleMetadata}
        slug="safety"
      >
        {/* Overview */}
        <div className="mt-8">
          <SectionContainer
            title="Safety First Approach"
            bgColor="transparent"
            radius={false}
          >
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              At Z-Beam, safety is our top priority. Laser cleaning is a powerful and effective industrial process, 
              but it requires proper training, equipment, and protocols to ensure safe operation. This guide outlines 
              the essential safety considerations for laser cleaning operations.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <ShieldIcon className="text-blue-600 dark:text-blue-400 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Professional Guidance Available
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    Our safety specialists are available to discuss your specific application, 
                    material concerns, and facility requirements. Schedule a free consultation to ensure 
                    your laser cleaning operations meet all safety standards.
                  </p>
                </div>
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Critical Hazards */}
        <div className="mt-12">
          <SectionContainer
            title="Critical Hazards"
            bgColor="body"
            radius={true}
            horizPadding={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangleIcon className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-1" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Laser Radiation</h4>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Direct or reflected laser beams can cause permanent eye damage or skin burns. 
                  Class 4 lasers used in cleaning operations require strict safety protocols and certified operators.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangleIcon className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-1" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Toxic Fumes</h4>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Vaporized contaminants and material byproducts can release hazardous gases. 
                  Certain materials (like PVC) produce toxic chlorine gas when exposed to laser radiation.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangleIcon className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-1" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Fire Risk</h4>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  High-energy laser pulses can ignite flammable materials, coatings, or accumulated dust. 
                  Fire suppression systems and clear workspace protocols are mandatory.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangleIcon className="text-red-600 dark:text-red-400 text-xl flex-shrink-0 mt-1" />
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Electrical Hazards</h4>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  Industrial laser systems operate at high voltages. Only qualified technicians 
                  should perform maintenance or repairs. Lockout/tagout procedures are essential.
                </p>
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Required Safety Equipment */}
        <div className="mt-12">
          <SectionContainer
            title="Required Safety Equipment"
            bgColor="transparent"
            radius={false}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="text-green-600" />
                  Personal Protective Equipment (PPE)
                </h4>
                <ul className="space-y-2 ml-8 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Laser Safety Glasses:</strong> OD 7+ rated for specific wavelength (typically 1064nm for fiber lasers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Respiratory Protection:</strong> P100 or supplied-air respirator depending on material and contaminants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Protective Clothing:</strong> Flame-resistant garments covering all exposed skin</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Hearing Protection:</strong> Required in high-noise environments (some systems exceed 85 dBA)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CheckCircleIcon className="text-green-600" />
                  Facility Requirements
                </h4>
                <ul className="space-y-2 ml-8 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Fume Extraction System:</strong> High-efficiency filtration (HEPA + activated carbon minimum)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Laser Safety Curtains:</strong> Rated for laser class and wavelength to prevent stray beam exposure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Warning Signage:</strong> Illuminated "Laser in Use" signs at all entry points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Emergency Stops:</strong> Accessible e-stop buttons within easy reach of operator</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span><strong>Fire Suppression:</strong> Appropriate extinguishers (typically Class ABC) within 30 feet</span>
                  </li>
                </ul>
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Material-Specific Warnings */}
        <div className="mt-12">
          <SectionContainer
            title="Material-Specific Safety Warnings"
            bgColor="body"
            radius={true}
            horizPadding={true}
          >
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ High-Risk Materials</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  The following materials require extreme caution or should be avoided:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li><strong>PVC (Polyvinyl Chloride):</strong> Releases toxic HCl gas - requires specialized ventilation</li>
                  <li><strong>Lead-containing materials:</strong> Vaporized lead is highly toxic - requires medical monitoring</li>
                  <li><strong>Asbestos-coated surfaces:</strong> Fiber release risk - typically prohibited</li>
                  <li><strong>Cadmium plating:</strong> Carcinogenic fumes - requires special permits</li>
                  <li><strong>Beryllium alloys:</strong> Extremely toxic dust - requires specialized handling</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">⚠️ Moderate-Risk Materials</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Chromium coatings, zinc plating, copper alloys, and painted surfaces require enhanced 
                  ventilation and operator protection but are generally acceptable with proper controls.
                </p>
              </div>

              <div className="border-l-4 border-green-600 pl-4">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">✓ Lower-Risk Materials</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Stainless steel, aluminum, carbon steel, and titanium are generally safe for laser cleaning 
                  when basic safety protocols are followed.
                </p>
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Regulatory Compliance */}
        <div className="mt-12">
          <SectionContainer
            title="Regulatory Compliance"
            bgColor="transparent"
            radius={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">OSHA Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>29 CFR 1926.102 - Eye and face protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>29 CFR 1910.134 - Respiratory protection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>29 CFR 1910.147 - Lockout/tagout procedures</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">ANSI Standards</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>ANSI Z136.1 - Safe use of lasers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>ANSI Z136.9 - Safe use in manufacturing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>ANSI Z87.1 - Eye and face protection</span>
                  </li>
                </ul>
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* Training Requirements */}
        <div className="mt-12">
          <SectionContainer
            title="Operator Training Requirements"
            bgColor="body"
            radius={true}
            horizPadding={true}
          >
            <p className="text-base text-gray-700 dark:text-gray-300 mb-4">
              All laser cleaning operators must complete comprehensive training covering:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Laser physics and safety fundamentals</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Equipment operation and maintenance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Material-specific hazard recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>PPE selection and proper use</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Emergency response procedures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Fume extraction system operation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Regulatory compliance requirements</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="text-green-600 flex-shrink-0 mt-1" />
                  <span>Hazard communication (OSHA 1910.1200)</span>
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Z-Beam provides comprehensive operator training as part of our service packages. 
                Contact us to discuss training requirements for your team.
              </p>
            </div>
          </SectionContainer>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 mb-8">
          <SectionContainer
            title=""
            bgColor="body"
            radius={true}
            horizPadding={true}
          >
            <div className="text-center py-6">
              <PhoneIcon className="text-4xl text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                Questions About Laser Safety?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Our safety specialists are available to discuss your specific application, 
                facility requirements, and compliance needs. Schedule a free consultation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+16502418510"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <PhoneIcon />
                  Call (650) 241-8510
                </a>
                <a 
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-8 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Send a Message
                </a>
              </div>
            </div>
          </SectionContainer>
        </div>
      </Layout>
    </>
  );
}
