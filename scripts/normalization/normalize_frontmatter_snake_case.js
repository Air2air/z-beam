#!/usr/bin/env node
/**
 * normalize_frontmatter_snake_case.js
 * Comprehensive script to normalize snake_case properties to camelCase in frontmatter YAML files
 * 
 * Target patterns:
 * - country_display → countryDisplay
 * - persona_file → personaFile  
 * - formatting_file → formattingFile
 * - Any other snake_case patterns
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Snake case to camelCase conversion function
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Recursively convert snake_case keys to camelCase
function convertSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(convertSnakeCase);
    }
    
    if (obj !== null && typeof obj === 'object') {
        const converted = {};
        for (const [key, value] of Object.entries(obj)) {
            const camelKey = snakeToCamel(key);
            converted[camelKey] = convertSnakeCase(value);
        }
        return converted;
    }
    
    return obj;
}

function processYamlFile(filePath) {
    try {
        console.log(`Processing: ${path.relative(process.cwd(), filePath)}`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(content);
        
        // Convert snake_case to camelCase
        const convertedData = convertSnakeCase(data);
        
        // Write back with consistent formatting
        const yamlOutput = yaml.dump(convertedData, {
            noRefs: true,
            quotingType: '"',
            forceQuotes: false,
            lineWidth: -1,
            noCompatMode: true,
            condenseFlow: false,
            indent: 2,
            sortKeys: false
        });
        
        fs.writeFileSync(filePath, yamlOutput, 'utf8');
        console.log(`✅ Converted snake_case properties in: ${path.basename(filePath)}`);
        
        return true;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function findYamlFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findYamlFiles(fullPath));
        } else if (item.endsWith('.yaml') || item.endsWith('.yml')) {
            files.push(fullPath);
        }
    }
    
    return files;
}

async function main() {
    console.log('🔧 Starting frontmatter snake_case to camelCase normalization...\n');
    
    const frontmatterDir = path.resolve(__dirname, 'frontmatter');
    
    if (!fs.existsSync(frontmatterDir)) {
        console.error('❌ frontmatter directory not found');
        process.exit(1);
    }
    
    const yamlFiles = findYamlFiles(frontmatterDir);
    console.log(`📁 Found ${yamlFiles.length} YAML files to process\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of yamlFiles) {
        if (processYamlFile(file)) {
            successCount++;
        } else {
            errorCount++;
        }
    }
    
    console.log('\n📊 NORMALIZATION COMPLETE');
    console.log(`✅ Successfully processed: ${successCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    
    if (errorCount > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}