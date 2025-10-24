/**
 * @component MaterialFAQ
 * @purpose Auto-generates material-specific FAQs from frontmatter data
 * @dependencies @/types (MaterialFAQProps)
 * @related Layout.tsx, jsonld-helper.ts
 * @complexity Medium (dynamic Q&A generation based on material properties)
 * @aiContext Automatically creates SEO-optimized FAQs highlighting unique material
 *           characteristics, special requirements, and differentiation factors
 */
// app/components/FAQ/MaterialFAQ.tsx
"use client";

import { SectionTitle } from "../SectionTitle/SectionTitle";

export interface MaterialFAQProps {
  materialName: string;
  category: string;
  subcategory?: string;
  materialProperties?: any;
  machineSettings?: any;
  applications?: string[];
  environmentalImpact?: any[];
  outcomeMetrics?: any[];
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates intelligent, material-specific FAQ based on unique characteristics
 */
export function MaterialFAQ({
  materialName,
  category,
  subcategory,
  materialProperties = {},
  machineSettings = {},
  applications = [],
  environmentalImpact = [],
  outcomeMetrics = [],
  className = "",
}: MaterialFAQProps) {
  const faqs = generateMaterialFAQs({
    materialName,
    category,
    subcategory,
    materialProperties,
    machineSettings,
    applications,
    environmentalImpact,
    outcomeMetrics,
  });

  if (faqs.length === 0) return null;

  return (
    <section className={`material-faq ${className}`} aria-labelledby="faq-heading">
      <SectionTitle
        title={`${materialName} Laser Cleaning FAQs`}
        subtitle="Common questions about laser cleaning specifications and requirements"
        id="faq-heading"
      />

      <div className="faq-container space-y-4 max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="faq-item group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            <summary className="faq-question cursor-pointer px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
              <span className="text-base md:text-lg pr-4">{faq.question}</span>
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <div className="faq-answer px-6 py-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

/**
 * Core FAQ generation logic - analyzes frontmatter to create material-specific questions
 */
function generateMaterialFAQs(data: {
  materialName: string;
  category: string;
  subcategory?: string;
  materialProperties: any;
  machineSettings: any;
  applications: string[];
  environmentalImpact: any[];
  outcomeMetrics: any[];
}): FAQItem[] {
  const {
    materialName,
    category,
    subcategory,
    materialProperties,
    machineSettings,
    applications,
    environmentalImpact,
    outcomeMetrics,
  } = data;

  const faqs: FAQItem[] = [];

  // Extract key properties
  const matChar = materialProperties?.material_characteristics || {};
  const laserInteraction = materialProperties?.laser_material_interaction || {};

  // 1. UNIQUE CHALLENGE FAQ - Based on hardness/toughness/special properties
  const uniqueChallenge = getUniqueChallengeQuestion(materialName, category, matChar);
  if (uniqueChallenge) faqs.push(uniqueChallenge);

  // 2. WAVELENGTH/ABSORPTION FAQ - Why specific laser settings
  const wavelengthFAQ = getWavelengthQuestion(materialName, machineSettings, laserInteraction);
  if (wavelengthFAQ) faqs.push(wavelengthFAQ);

  // 3. THERMAL SENSITIVITY FAQ - Temperature concerns
  const thermalFAQ = getThermalQuestion(materialName, matChar, machineSettings);
  if (thermalFAQ) faqs.push(thermalFAQ);

  // 4. APPLICATION-SPECIFIC FAQ - Industry requirements
  const applicationFAQ = getApplicationQuestion(materialName, applications, category);
  if (applicationFAQ) faqs.push(applicationFAQ);

  // 5. COMPARISON FAQ - vs other materials in category
  const comparisonFAQ = getComparisonQuestion(materialName, category, subcategory, matChar);
  if (comparisonFAQ) faqs.push(comparisonFAQ);

  // 6. SURFACE QUALITY FAQ - Expected outcomes
  const outcomeFAQ = getOutcomeQuestion(materialName, outcomeMetrics);
  if (outcomeFAQ) faqs.push(outcomeFAQ);

  // 7. ENVIRONMENTAL FAQ - Sustainability benefits
  const envFAQ = getEnvironmentalQuestion(materialName, environmentalImpact);
  if (envFAQ) faqs.push(envFAQ);

  return faqs;
}

// FAQ Generator Functions - Each focuses on unique material characteristics

function getUniqueChallengeQuestion(
  materialName: string,
  category: string,
  matChar: any
): FAQItem | null {
  const hardness = matChar?.hardness?.value;
  const thermalCond = matChar?.thermalConductivity?.value;
  const reflectivity = matChar?.laserReflectivity?.value;

  let challenge = "";

  // Ultra-hard materials
  if (hardness && hardness > 1000) {
    challenge = `${materialName} is an extremely hard material (${hardness} ${matChar.hardness.unit}), making it resistant to mechanical cleaning methods. The challenge is removing contaminants without damaging the precision-machined surface integrity that's critical in high-performance applications. Laser cleaning uses controlled energy pulses that ablate only the contamination layer while preserving the base material's hardness and surface finish.`;
  }
  // High thermal conductivity metals
  else if (thermalCond && thermalCond > 100) {
    challenge = `${materialName} has high thermal conductivity (${thermalCond} ${matChar.thermalConductivity.unit}), meaning heat dissipates rapidly across the surface. This requires precise laser parameters to achieve sufficient energy density for contamination removal without excessive heat spread. Our optimized pulse duration and repetition rate ensure localized cleaning without thermal damage to surrounding areas.`;
  }
  // High reflectivity metals
  else if (reflectivity && reflectivity > 70) {
    challenge = `${materialName} is highly reflective to laser light (${reflectivity}% reflectivity), which can reduce cleaning efficiency and pose safety concerns from reflected beams. The key is using optimal wavelength selection and controlled pulse parameters that maximize absorption in the contaminant layer while managing reflective losses. This ensures safe, effective cleaning without excessive power requirements.`;
  }
  // Ceramics and fragile materials
  else if (category === "Ceramic" || category === "Glass") {
    challenge = `${materialName}, as a ${category.toLowerCase()}, is brittle and susceptible to thermal shock and micro-cracking. The challenge is removing surface contaminants without inducing thermal stress that could cause fractures. Short-pulse laser cleaning minimizes heat-affected zones and controls energy delivery to stay within safe thermal gradients for this material class.`;
  }
  // Default for other materials
  else {
    challenge = `${materialName} requires specialized laser cleaning parameters due to its unique combination of ${category.toLowerCase()} properties. The challenge is balancing effective contamination removal with preservation of surface integrity, which demands precise control of laser fluence, pulse duration, and scanning patterns optimized for this specific material.`;
  }

  return {
    question: `What makes ${materialName} challenging to laser clean?`,
    answer: challenge,
  };
}

function getWavelengthQuestion(
  materialName: string,
  machineSettings: any,
  laserInteraction: any
): FAQItem | null {
  const wavelength = machineSettings?.wavelength?.value;
  const absorption = laserInteraction?.laserAbsorption?.value;

  if (!wavelength) return null;

  const wavelengthType =
    wavelength === 1064
      ? "near-infrared (1064 nm)"
      : wavelength === 532
      ? "green (532 nm)"
      : wavelength === 355
      ? "UV (355 nm)"
      : `${wavelength} nm`;

  let reasoning = "";

  if (absorption && absorption > 40) {
    reasoning = `${materialName} has relatively high laser absorption at this wavelength (${absorption}%), making ${wavelengthType} laser light highly efficient for energy coupling into surface contaminants. This high absorption rate allows for effective cleaning at lower power levels, reducing thermal stress and improving process safety.`;
  } else if (absorption && absorption < 20) {
    reasoning = `While ${materialName} has moderate absorption at ${wavelengthType} (${absorption}%), this wavelength is selected because contaminants typically have higher absorption than the base material. This selectivity allows the laser to preferentially remove oxides, oils, and other surface layers while minimizing energy transfer to the substrate.`;
  } else {
    reasoning = `The ${wavelengthType} wavelength is optimal for ${materialName} because it balances absorption efficiency with controlled penetration depth. This allows precise removal of surface contaminants while maintaining a safe margin from the material's damage threshold.`;
  }

  return {
    question: `Why is ${wavelength} nm wavelength recommended for ${materialName}?`,
    answer: reasoning,
  };
}

function getThermalQuestion(
  materialName: string,
  matChar: any,
  machineSettings: any
): FAQItem | null {
  const thermalDest = matChar?.thermalDestruction?.value;
  const meltingPoint = matChar?.meltingPoint?.value;
  const pulseWidth = machineSettings?.pulseWidth?.value;

  const tempLimit = thermalDest || meltingPoint;
  if (!tempLimit) return null;

  const pulseInfo = pulseWidth
    ? `Using ${pulseWidth} ${machineSettings.pulseWidth.unit} pulses`
    : "Using optimized short-pulse laser parameters";

  return {
    question: `Can laser cleaning damage ${materialName} through overheating?`,
    answer: `${materialName} has a thermal limit of ${tempLimit}°C, which our laser cleaning process stays well below. ${pulseInfo} ensures that heat input is confined to the contamination layer with minimal thermal diffusion into the base material. The short interaction time (nanosecond scale) prevents bulk heating, and the scanning pattern allows cooling between passes. This results in surface temperatures that remain safely below critical thresholds, preserving material properties and preventing thermal damage, oxidation, or phase changes.`,
  };
}

function getApplicationQuestion(
  materialName: string,
  applications: string[],
  category: string
): FAQItem | null {
  if (!applications || applications.length === 0) return null;

  // Pick top 3-4 most demanding applications
  const keyApps = applications.slice(0, 4);
  const appList = keyApps.join(", ");

  let requirements = "";

  if (applications.includes("Aerospace") || applications.includes("Medical")) {
    requirements = `These industries demand ultra-clean surfaces free from any contamination that could compromise performance or safety. Laser cleaning of ${materialName} achieves precision cleaning without introducing secondary contamination from abrasives, chemicals, or cleaning media. The non-contact process preserves tight tolerances and critical surface finishes required for ${category.toLowerCase()} components in these demanding applications.`;
  } else if (applications.includes("Electronics Manufacturing") || applications.includes("Semiconductor")) {
    requirements = `Electronics and semiconductor applications require particle-free surfaces with precise control over surface properties. Laser cleaning ${materialName} removes contamination at the micron scale without generating particles or residues that could interfere with bonding, coating, or circuit performance. The dry, chemical-free process is ideal for cleanroom-compatible manufacturing.`;
  } else if (applications.includes("Cultural Heritage") || applications.includes("Art Restoration")) {
    requirements = `Conservation work on ${materialName} artifacts requires extremely gentle, selective cleaning that removes degradation products while preserving original surface patina and texture. Laser cleaning offers unprecedented control, allowing conservators to clean layer-by-layer with real-time visual feedback, ensuring irreplaceable ${category.toLowerCase()} objects are cleaned safely without irreversible damage.`;
  } else {
    requirements = `Industrial applications of ${materialName} in ${appList} require reliable, repeatable cleaning that maintains production quality while reducing consumables and waste. Laser cleaning provides consistent results, eliminates chemical disposal costs, and scales efficiently for high-volume processing while meeting strict surface cleanliness specifications.`;
  }

  return {
    question: `Why is laser cleaning preferred for ${materialName} in ${keyApps[0]} applications?`,
    answer: requirements,
  };
}

function getComparisonQuestion(
  materialName: string,
  category: string,
  subcategory: string | undefined,
  matChar: any
): FAQItem | null {
  let comparison = "";

  if (category === "Metal") {
    const thermalCond = matChar?.thermalConductivity?.value;
    const reflectivity = matChar?.laserReflectivity?.value;

    if (thermalCond && thermalCond > 200) {
      comparison = `Compared to lower thermal conductivity metals, ${materialName} requires higher laser fluence and faster pulse delivery to overcome rapid heat dissipation. Our parameters are specifically optimized for this high thermal conductivity (${thermalCond} ${matChar.thermalConductivity.unit}), ensuring effective cleaning efficiency that wouldn't transfer directly from other metal alloys.`;
    } else if (reflectivity && reflectivity > 70) {
      comparison = `${materialName} is more reflective than many other metals (${reflectivity}% reflectivity), requiring careful wavelength selection and potentially higher power levels than less reflective materials. The cleaning process must account for this reflectivity to maintain efficiency and safety.`;
    } else {
      comparison = `${materialName} falls in the moderate range for metallic properties, making it more forgiving than highly reflective or thermally conductive metals. However, each metal still requires parameter optimization based on its specific absorption characteristics, oxide layer formation, and contamination types.`;
    }
  } else if (category === "Ceramic") {
    comparison = `Unlike metals, ${materialName} as a ceramic material is brittle and has lower thermal conductivity, making it more susceptible to thermal shock. Laser parameters must use shorter pulses and lower energy densities compared to metal cleaning to prevent micro-cracking, while still achieving effective contamination removal. This makes ${materialName} more challenging than ductile materials.`;
  } else if (category === "Polymer" || category === "Composite") {
    comparison = `${materialName} has a much lower thermal damage threshold compared to metals and ceramics. This requires ultra-short pulses, lower fluence, and careful thermal management to avoid substrate degradation. The cleaning parameters are significantly different from those used for inorganic materials, emphasizing precision over aggressive removal.`;
  } else {
    comparison = `${materialName}'s position within the ${category} category means it shares some characteristics with similar materials but requires specific parameter optimization based on its unique composition, structure, and surface properties. Direct transfer of cleaning parameters from other materials may not achieve optimal results.`;
  }

  return {
    question: `How does ${materialName} laser cleaning differ from other ${category.toLowerCase()}s?`,
    answer: comparison,
  };
}

function getOutcomeQuestion(
  materialName: string,
  outcomeMetrics: any[]
): FAQItem | null {
  if (!outcomeMetrics || outcomeMetrics.length === 0) return null;

  // Look for removal efficiency metric
  const efficiencyMetric = outcomeMetrics.find((m: any) =>
    Object.keys(m).some((k) => k.toLowerCase().includes("removal") || k.toLowerCase().includes("efficiency"))
  );

  if (!efficiencyMetric) return null;

  const metricKey = Object.keys(efficiencyMetric)[0];
  const metricData = efficiencyMetric[metricKey];
  const range = metricData.typicalRanges || "95-99%";

  return {
    question: `What surface quality can I expect after laser cleaning ${materialName}?`,
    answer: `Laser cleaning typically achieves ${range} contaminant removal efficiency on ${materialName} surfaces. You can expect complete removal of oxides, oils, carbonaceous deposits, and other surface contamination while preserving the base material's surface finish and dimensional tolerances. The process leaves a chemically clean, activated surface ideal for coating, bonding, or inspection without residual chemical contamination or mechanical damage. Surface roughness is typically maintained or slightly reduced compared to pre-cleaning conditions.`,
  };
}

function getEnvironmentalQuestion(
  materialName: string,
  environmentalImpact: any[]
): FAQItem | null {
  if (!environmentalImpact || environmentalImpact.length === 0) return null;

  const benefits = environmentalImpact.map((impact) => impact.benefit).join(", ");
  const hasWaterBenefit = environmentalImpact.some((impact) =>
    impact.benefit?.toLowerCase().includes("water")
  );
  const hasChemicalBenefit = environmentalImpact.some((impact) =>
    impact.benefit?.toLowerCase().includes("chemical")
  );

  let answer = `Laser cleaning ${materialName} is a dry, chemical-free process with significant environmental advantages: `;

  if (hasChemicalBenefit) {
    answer += `eliminates hazardous chemical waste streams and VOC emissions; `;
  }
  if (hasWaterBenefit) {
    answer += `requires no water consumption; `;
  }
  answer += `produces minimal waste (only ablated material particles that can be captured by filtration); and reduces overall energy consumption compared to traditional heating/chemical processes. The process supports sustainable manufacturing initiatives and helps facilities meet environmental compliance requirements while reducing operating costs.`;

  return {
    question: `What are the environmental benefits of laser cleaning ${materialName}?`,
    answer: answer,
  };
}
