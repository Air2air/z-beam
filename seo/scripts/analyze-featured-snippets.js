#!/usr/bin/env node

/**
 * Featured Snippet Helper
 * Analyzes content and suggests optimizations for featured snippets
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Extract h2 headings that are questions
 */
function extractQuestions(content) {
  const questionRegex = /^##\s+(How|What|Why|When|Where|Can|Is|Are|Do|Does|Should|Will)\s+[^?\n]+\??$/gim;
  return content.match(questionRegex) || [];
}

/**
 * Check if answer follows question (40-60 words optimal)
 */
function analyzeAnswer(content, question) {
  const questionIndex = content.indexOf(question);
  if (questionIndex === -1) return null;
  
  // Get next 300 characters after question
  const afterQuestion = content.slice(questionIndex + question.length, questionIndex + question.length + 300);
  
  // Extract first paragraph
  const firstParagraph = afterQuestion.split('\n\n')[0].trim();
  const wordCount = firstParagraph.split(/\s+/).length;
  
  return {
    answer: firstParagraph,
    wordCount,
    optimal: wordCount >= 40 && wordCount <= 60,
    tooShort: wordCount < 40,
    tooLong: wordCount > 60
  };
}

/**
 * Check for list/table formats
 */
function hasStructuredFormat(content, question) {
  const questionIndex = content.indexOf(question);
  if (questionIndex === -1) return false;
  
  const afterQuestion = content.slice(questionIndex, questionIndex + 500);
  
  return {
    hasList: /^[\s]*[-*]\s+/m.test(afterQuestion) || /^\d+\.\s+/m.test(afterQuestion),
    hasTable: /\|.*\|/.test(afterQuestion)
  };
}

/**
 * Analyze frontmatter file for featured snippet potential
 */
async function analyzeFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let frontmatter, body;
  
  try {
    const parts = content.split('---');
    if (parts.length >= 3) {
      frontmatter = yaml.load(parts[1]);
      body = parts.slice(2).join('---');
    } else {
      frontmatter = yaml.load(content);
      body = '';
    }
  } catch (e) {
    return null;
  }
  
  const questions = extractQuestions(body);
  const analysis = [];
  
  questions.forEach(question => {
    const answer = analyzeAnswer(body, question);
    const formats = hasStructuredFormat(body, question);
    
    analysis.push({
      question: question.replace(/^##\s+/, ''),
      ...answer,
      ...formats,
      recommendations: []
    });
    
    // Generate recommendations
    const lastItem = analysis[analysis.length - 1];
    if (lastItem.tooShort) {
      lastItem.recommendations.push('Expand answer to 40-60 words');
    }
    if (lastItem.tooLong) {
      lastItem.recommendations.push('Condense answer to 40-60 words');
    }
    if (!lastItem.hasList && !lastItem.hasTable) {
      lastItem.recommendations.push('Consider adding a list or table format');
    }
  });
  
  return {
    file: filePath,
    title: frontmatter.title || frontmatter.name,
    questionsFound: questions.length,
    analysis
  };
}

/**
 * Generate featured snippet optimization report
 */
async function generateReport(directory) {
  const files = fs.readdirSync(directory);
  const results = [];
  
  for (const file of files) {
    if (!file.endsWith('.yaml') && !file.endsWith('.yml') && !file.endsWith('.md')) continue;
    
    const filePath = path.join(directory, file);
    const analysis = await analyzeFrontmatter(filePath);
    
    if (analysis && analysis.questionsFound > 0) {
      results.push(analysis);
    }
  }
  
  // Sort by optimization potential (most questions, least optimal)
  results.sort((a, b) => {
    const aOptimal = a.analysis.filter(q => q.optimal).length;
    const bOptimal = b.analysis.filter(q => q.optimal).length;
    return (aOptimal - a.questionsFound) - (bOptimal - b.questionsFound);
  });
  
  return results;
}

/**
 * Print report to console
 */
function printReport(results) {
  console.log('\n📊 Featured Snippet Optimization Report\n');
  console.log(`Found ${results.length} pages with question headings\n`);
  
  results.forEach(result => {
    console.log(`📄 ${result.title}`);
    console.log(`   File: ${result.file}`);
    console.log(`   Questions: ${result.questionsFound}`);
    
    result.analysis.forEach((q, i) => {
      const status = q.optimal ? '✅' : '⚠️';
      console.log(`\n   ${status} Q${i + 1}: ${q.question}`);
      console.log(`      Words: ${q.wordCount} ${q.optimal ? '(optimal)' : q.tooShort ? '(too short)' : '(too long)'}`);
      console.log(`      Format: ${q.hasList ? 'List ✅' : q.hasTable ? 'Table ✅' : 'Plain text ⚠️'}`);
      
      if (q.recommendations.length > 0) {
        console.log(`      💡 Recommendations:`);
        q.recommendations.forEach(rec => console.log(`         - ${rec}`));
      }
    });
    
    console.log('\n' + '─'.repeat(80));
  });
  
  // Summary statistics
  const totalQuestions = results.reduce((sum, r) => sum + r.questionsFound, 0);
  const optimalQuestions = results.reduce((sum, r) => 
    sum + r.analysis.filter(q => q.optimal).length, 0
  );
  
  console.log('\n📈 Summary:');
  console.log(`   Total questions: ${totalQuestions}`);
  console.log(`   Optimal format: ${optimalQuestions} (${Math.round(optimalQuestions / totalQuestions * 100)}%)`);
  console.log(`   Need optimization: ${totalQuestions - optimalQuestions}\n`);
}

/**
 * Main execution
 */
async function main() {
  const targetDir = process.argv[2] || './frontmatter/materials';
  
  console.log(`\n🔍 Analyzing ${targetDir} for featured snippet opportunities...\n`);
  
  const results = await generateReport(targetDir);
  printReport(results);
  
  // Save JSON report
  const reportPath = './seo/analysis/featured-snippets-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📁 Full report saved to: ${reportPath}\n`);
}

main().catch(console.error);
