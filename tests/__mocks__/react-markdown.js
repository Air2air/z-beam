// tests/__mocks__/react-markdown.js
// Mock for react-markdown to avoid ES module transformation issues

const React = require('react');

function ReactMarkdown({ children, ...props }) {
  return React.createElement('div', {
    className: 'markdown-mock',
    'data-testid': 'react-markdown',
    ...props
  }, children);
}

module.exports = ReactMarkdown;
module.exports.default = ReactMarkdown;
