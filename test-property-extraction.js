// Quick test to verify property extraction
const testMetadata = {
  materialProperties: {
    laser_material_interaction: {
      label: "Laser-Material Interaction",
      properties: {
        specificHeat: {
          value: 840.0,
          unit: "J/(kg·K)",
          confidence: 88
        }
      }
    }
  }
};

function normalizePropertyName(name) {
  return name.toLowerCase().replace(/[^\w]/g, '');
}

function parsePropertiesFromMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object') return [];
  
  const properties = [];
  
  const extractProperty = (key, data, parentKey) => {
    if (!data) return;
    
    if (typeof data === 'object' && data !== null) {
      if (data.value !== undefined || data.numeric !== undefined) {
        const propertyName = key;
        const value = data.value !== undefined
          ? (data.unit ? `${data.value} ${data.unit}` : String(data.value))
          : (data.units ? `${data.numeric} ${data.units}` : String(data.numeric));
        properties.push({ property: propertyName, value });
      } else {
        const hasCategoryStructure = 
          data.hasOwnProperty('label') && 
          data.hasOwnProperty('properties') && 
          typeof data.properties === 'object';
        
        const metadataKeys = ['label', 'description', 'percentage'];
        const isMetadataKey = metadataKeys.includes(key);
        
        Object.entries(data).forEach(([nestedKey, nestedValue]) => {
          if (hasCategoryStructure || isMetadataKey) {
            extractProperty(nestedKey, nestedValue, key === 'properties' ? parentKey : key);
          } else {
            const newParentKey = parentKey ? `${parentKey}.${key}` : key;
            extractProperty(nestedKey, nestedValue, newParentKey);
          }
        });
      }
    } else if (data !== null && data !== undefined) {
      const propertyName = parentKey ? `${parentKey}.${key}` : key;
      properties.push({ property: propertyName, value: String(data) });
    }
  };
  
  if (metadata.materialProperties) {
    Object.entries(metadata.materialProperties).forEach(([key, value]) => {
      extractProperty(key, value);
    });
  }
  
  return properties;
}

const extracted = parsePropertiesFromMetadata(testMetadata);
console.log('Extracted properties:', JSON.stringify(extracted, null, 2));

// Test matching
const searchProperty = 'specificHeat';
const searchValue = '840';

const normalizedSearchProperty = normalizePropertyName(searchProperty);

extracted.forEach(prop => {
  const normalizedPropName = normalizePropertyName(prop.property);
  const propNameMatch = normalizedPropName === normalizedSearchProperty;
  
  console.log(`\nProperty: ${prop.property}`);
  console.log(`Normalized: ${normalizedPropName}`);
  console.log(`Search: ${normalizedSearchProperty}`);
  console.log(`Name Match: ${propNameMatch}`);
  console.log(`Value: ${prop.value}`);
  
  if (propNameMatch) {
    const searchVal = String(searchValue).toLowerCase().trim();
    const actualVal = String(prop.value).toLowerCase().trim();
    
    const searchNum = parseFloat(searchVal.match(/[\d.]+/)?.[0] || searchVal);
    const propValString = actualVal.match(/[\d.]+/)?.[0] || actualVal;
    const propNum = parseFloat(propValString);
    
    console.log(`Search number: ${searchNum}`);
    console.log(`Prop number: ${propNum}`);
    
    if (!isNaN(searchNum) && !isNaN(propNum)) {
      const tolerance = Math.max(Math.abs(searchNum * 0.1), 0.1);
      const diff = Math.abs(propNum - searchNum);
      const numericMatch = diff <= tolerance;
      
      console.log(`Tolerance: ${tolerance}`);
      console.log(`Diff: ${diff}`);
      console.log(`Numeric Match: ${numericMatch}`);
    }
  }
});
