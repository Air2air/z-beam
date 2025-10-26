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
  caption?: {
    beforeText?: string;
    afterText?: string;
    description?: string;
  };
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
  caption = {},
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
    caption,
  });

  if (faqs.length === 0) return null;

  return (
    <section className={className} aria-labelledby="faq-heading">
      <SectionTitle
        title={`${materialName} Laser Cleaning FAQs`}
        id="faq-heading"
      />

      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-md mb-4"
        >
          <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-between group-open:border-b group-open:border-gray-200 dark:group-open:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 group-open:bg-gray-50 dark:group-open:bg-gray-700/50">
            <span className="text-sm md:text-base pr-4">{faq.question}</span>
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
          <div className="px-6 py-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-700/50">
            {faq.answer}
          </div>
        </details>
      ))}
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
  caption?: {
    beforeText?: string;
    afterText?: string;
    description?: string;
  };
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
    caption = {},
  } = data;

  const faqs: FAQItem[] = [];

  // Extract key properties
  const matChar = materialProperties?.material_characteristics || {};
  const laserInteraction = materialProperties?.laser_material_interaction || {};

  // 1. CONTAMINANT-SPECIFIC FAQ - From caption.beforeText
  const contaminantFAQ = getContaminantQuestion(materialName, caption, matChar);
  if (contaminantFAQ) faqs.push(contaminantFAQ);

  // 2. UNIQUE CHALLENGE FAQ - Based on hardness/toughness/special properties with comparisons
  const uniqueChallenge = getUniqueChallengeQuestion(materialName, category, matChar, laserInteraction);
  if (uniqueChallenge) faqs.push(uniqueChallenge);

  // 3. WAVELENGTH/ABSORPTION FAQ - Why specific laser settings
  const wavelengthFAQ = getWavelengthQuestion(materialName, machineSettings, laserInteraction);
  if (wavelengthFAQ) faqs.push(wavelengthFAQ);

  // 4. THERMAL SENSITIVITY FAQ - Temperature concerns
  const thermalFAQ = getThermalQuestion(materialName, matChar, machineSettings);
  if (thermalFAQ) faqs.push(thermalFAQ);

  // 5. APPLICATION-SPECIFIC FAQ - Industry requirements
  const applicationFAQ = getApplicationQuestion(materialName, applications, category);
  if (applicationFAQ) faqs.push(applicationFAQ);

  // 6. COMPARISON FAQ - vs other materials in category with specific metrics
  const comparisonFAQ = getComparisonQuestion(materialName, category, subcategory, matChar, laserInteraction);
  if (comparisonFAQ) faqs.push(comparisonFAQ);

  // 7. SURFACE QUALITY FAQ - Expected outcomes from caption.afterText
  const outcomeFAQ = getOutcomeQuestion(materialName, outcomeMetrics, caption);
  if (outcomeFAQ) faqs.push(outcomeFAQ);

  // 8. ENVIRONMENTAL FAQ - Sustainability benefits
  const envFAQ = getEnvironmentalQuestion(materialName, environmentalImpact);
  if (envFAQ) faqs.push(envFAQ);

  return faqs;
}

// FAQ Generator Functions - Each focuses on unique material characteristics

// NEW: Contaminant-specific FAQ from caption.beforeText
function getContaminantQuestion(
  materialName: string,
  caption: any,
  matChar: any
): FAQItem | null {
  const beforeText = caption?.beforeText;
  if (!beforeText || beforeText.length < 50) return null;

  // Extract contaminant types from beforeText
  const contaminants: string[] = [];
  const contaminantKeywords = {
    'oxide': /oxide\s+layer|oxidation|Al₂O₃|rust/gi,
    'carbonaceous deposits': /carbon|grime|soot|organic/gi,
    'oils and grease': /oil|grease|lubricant/gi,
    'paint and coatings': /paint|coating|finish/gi,
    'pitting': /pitting|corrosion|degradation/gi,
    'scale': /scale|buildup|deposit/gi
  };

  for (const [contaminant, regex] of Object.entries(contaminantKeywords)) {
    if (regex.test(beforeText)) {
      contaminants.push(contaminant);
    }
  }

  if (contaminants.length === 0) return null;

  // Extract thickness/severity if mentioned
  const thicknessMatch = beforeText.match(/(\d+(?:\.\d+)?)\s*(?:to\s*)?(\d+(?:\.\d+)?)?\s*(?:microns?|μm)/i);
  const thickness = thicknessMatch ? 
    (thicknessMatch[2] ? `${thicknessMatch[1]}-${thicknessMatch[2]} microns` : `${thicknessMatch[1]} microns`) : 
    null;

  const contaminantList = contaminants.length > 2 
    ? `${contaminants.slice(0, -1).join(', ')}, and ${contaminants[contaminants.length - 1]}`
    : contaminants.join(' and ');

  let answer = `Laser cleaning effectively removes ${contaminantList} from ${materialName} surfaces. `;
  
  if (thickness) {
    answer += `Common contamination thicknesses of ${thickness} are efficiently ablated using optimized pulse energy and scanning patterns. `;
  }

  answer += `The process selectively targets contamination layers while preserving the underlying ${materialName} substrate. Each contaminant type has specific absorption characteristics at our laser wavelength, allowing controlled layer-by-layer removal with minimal thermal impact. Typical removal efficiency exceeds 95-99% for most contamination types encountered in industrial applications.`;

  return {
    question: `What types of contaminants can be removed from ${materialName}?`,
    answer: answer
  };
}

function getUniqueChallengeQuestion(
  materialName: string,
  category: string,
  matChar: any,
  laserInteraction: any
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
  matChar: any,
  laserInteraction: any
): FAQItem | null {
  let comparison = "";

  // Get specific property values for detailed comparison
  const hardness = matChar?.hardness?.value;
  const thermalCond = matChar?.thermalConductivity?.value;
  const reflectivity = laserInteraction?.laserReflectivity?.value;
  const absorption = laserInteraction?.laserAbsorption?.value;

  if (category === "Metal") {
    if (thermalCond && thermalCond > 200) {
      comparison = `${materialName} has exceptionally high thermal conductivity (${thermalCond} W/(m·K)), approximately 2-3× higher than common steel alloys (~50 W/(m·K)). This means heat dissipates much faster, requiring higher laser fluence and faster pulse delivery to achieve effective contamination removal. Unlike lower-conductivity metals where heat localizes, ${materialName} demands optimized parameters that account for rapid thermal spreading across the surface.`;
    } else if (thermalCond && thermalCond < 50) {
      comparison = `${materialName}'s thermal conductivity (${thermalCond} W/(m·K)) is significantly lower than highly conductive metals like aluminum (237 W/(m·K)) or copper (400 W/(m·K)). This allows better heat localization during laser cleaning, meaning lower power requirements and reduced risk of heat-affected zones compared to high-conductivity materials.`;
    } else if (reflectivity && reflectivity > 70) {
      comparison = `With ${reflectivity}% reflectivity, ${materialName} reflects significantly more laser energy than materials like mild steel (~40% reflectivity) or titanium (~50%). This means only ${absorption || 100 - reflectivity}% of incident energy is absorbed, requiring higher power levels (typically 20-40% more) than less reflective metals to achieve equivalent cleaning efficiency.`;
    } else if (reflectivity && reflectivity < 40) {
      comparison = `${materialName} has relatively low reflectivity (${reflectivity}%) compared to highly reflective metals like aluminum (88%) or copper (95%). This ${absorption || 100 - reflectivity}% absorption rate makes laser cleaning more efficient, requiring lower power settings and shorter process times than highly reflective materials.`;
    } else {
      comparison = `${materialName} exhibits moderate metallic properties (thermal conductivity: ${thermalCond || 'typical'} W/(m·K), reflectivity: ${reflectivity || 'standard'}%), placing it in the mid-range for laser cleaning efficiency. It's more forgiving than highly reflective or thermally conductive metals, but still requires material-specific parameter optimization for optimal results.`;
    }
  } else if (category === "Ceramic") {
    if (hardness && hardness > 1000) {
      comparison = `${materialName} is an ultra-hard ceramic (${hardness} ${matChar.hardness?.unit || 'HV'}), significantly harder than common ceramics like alumina (~1200 HV) or even sapphire (~2000 HV). This exceptional hardness makes mechanical cleaning impossible without surface damage, positioning laser cleaning as the only viable non-destructive method for contamination removal.`;
    } else {
      comparison = `Unlike ductile metals, ${materialName} as a ceramic material is brittle with lower thermal conductivity (typically ${matChar.thermalConductivity?.value || '2-20'} W/(m·K) vs metals at 50-400 W/(m·K)). This makes it highly susceptible to thermal shock and micro-cracking. Laser parameters must use shorter pulses and lower energy densities compared to metal cleaning—typically 30-50% lower fluence—to prevent fracture while achieving effective contamination removal.`;
    }
  } else if (category === "Polymer" || category === "Composite") {
    const thermalDest = matChar?.thermalDestruction?.value || matChar?.meltingPoint?.value;
    comparison = `${materialName} has a thermal damage threshold ${thermalDest ? `of ${thermalDest}°C` : 'significantly lower than metals (typically 150-400°C vs 500-1500°C)'}, requiring ultra-short pulses and reduced fluence. Compared to metals requiring 3-10 J/cm², polymers typically need 0.5-3 J/cm² to avoid substrate degradation. The cleaning approach emphasizes precision and selectivity over aggressive removal rates.`;
  } else {
    comparison = `${materialName}'s position within the ${category} category means it shares some characteristics with similar materials but has unique properties requiring specific parameter optimization. Thermal conductivity, absorption coefficient, and damage thresholds vary significantly across ${category.toLowerCase()}s, making direct parameter transfer from other materials unreliable for achieving optimal cleaning results.`;
  }

  return {
    question: `How does ${materialName} compare to similar materials for laser cleaning?`,
    answer: comparison,
  };
}

function getOutcomeQuestion(
  materialName: string,
  outcomeMetrics: any[],
  caption: any
): FAQItem | null {
  const afterText = caption?.afterText;
  
  // Extract specific outcomes from afterText if available
  let specificOutcomes: string[] = [];
  
  if (afterText && afterText.length > 50) {
    // Extract roughness measurements
    const roughnessMatch = afterText.match(/roughness.*?(\d+\.?\d*)\s*(?:microns?|μm)/i);
    if (roughnessMatch) {
      specificOutcomes.push(`surface roughness reduced to ${roughnessMatch[1]} microns`);
    }

    // Extract reflectivity improvements
    if (/reflectivity/i.test(afterText)) {
      specificOutcomes.push('significantly improved reflectivity');
    }

    // Check for heat-affected zone
    if (/no\s+heat[- ]affected\s+zone/i.test(afterText) || /no\s+HAZ/i.test(afterText)) {
      specificOutcomes.push('zero heat-affected zones');
    }

    // Extract efficiency/ROI mentions
    if (/efficiency|performance|optimization/i.test(afterText)) {
      specificOutcomes.push('enhanced optical/mechanical performance');
    }
  }

  // Look for removal efficiency metric
  const efficiencyMetric = outcomeMetrics?.find((m: any) =>
    Object.keys(m).some((k) => k.toLowerCase().includes("removal") || k.toLowerCase().includes("efficiency"))
  );

  const range = efficiencyMetric ? 
    (efficiencyMetric[Object.keys(efficiencyMetric)[0]]?.typicalRanges || "95-99.9%") : 
    "95-99.9%";

  let answer = `Laser cleaning of ${materialName} typically achieves ${range} contaminant removal efficiency. `;
  
  if (specificOutcomes.length > 0) {
    answer += `Expected outcomes include: ${specificOutcomes.join(', ')}. `;
  }

  answer += `The process completely removes oxides, oils, carbonaceous deposits, and other surface contamination while preserving the base material's surface finish and dimensional tolerances. You'll get a chemically clean, activated surface ideal for coating, bonding, or inspection—without residual chemical contamination, mechanical damage, or micro-structural changes. Surface roughness is typically maintained within ±0.2 microns of pre-cleaning conditions, with some materials showing slight improvement due to removal of roughness-inducing contaminants.`;

  return {
    question: `What surface quality results can I expect from laser cleaning ${materialName}?`,
    answer: answer,
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
