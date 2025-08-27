// Mock for marked library to handle ESM import issues
const marked = jest.fn((markdown) => {
  if (typeof markdown !== 'string') return '';
  // Simple markdown to HTML conversion for testing
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
    .replace(/^(?!<[h1-6|br])(.+)$/gim, '<p>$1</p>');
});

marked.parse = marked;

module.exports = marked;
module.exports.marked = marked;
module.exports.default = marked;
