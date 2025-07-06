import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartTagList } from '../SmartTagList';

// Mock tag config utilities
jest.mock('../utils/tagConfig', () => ({
  getTagInfo: (tag: string) => ({
    displayName: tag.charAt(0).toUpperCase() + tag.slice(1),
    color: { bg: 'bg-blue-100', text: 'text-blue-800' },
    category: tag === 'defense' ? 'industry' : 'material',
  }),
  sortTagsByPriority: (tags: string[]) => tags,
  filterTagsByCategory: (tags: string[], cats: string[]) => tags.filter(t => cats.includes('material')),
  groupTagsByCategory: (tags: string[]) => ({
    material: tags.filter(t => t !== 'defense'),
    industry: tags.filter(t => t === 'defense'),
  }),
}));

describe('SmartTagList', () => {
  it('renders nothing if no tags', () => {
    const { container } = render(<SmartTagList tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders all tags as clickable links by default', () => {
    render(<SmartTagList tags={['brass', 'defense']} />);
    expect(screen.getByText('Brass')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
    expect(screen.getByTitle('View all articles tagged with "Brass"')).toHaveAttribute('href', '/tags/brass');
    expect(screen.getByTitle('View all articles tagged with "Defense"')).toHaveAttribute('href', '/tags/defense');
  });

  it('renders tags as plain text if linkable is false', () => {
    render(<SmartTagList tags={['brass', 'defense']} linkable={false} />);
    expect(screen.getByText('Brass').closest('a')).toBeNull();
    expect(screen.getByText('Defense').closest('a')).toBeNull();
  });

  it('limits the number of tags displayed', () => {
    render(<SmartTagList tags={['brass', 'defense', 'steel']} maxTags={2} />);
    expect(screen.getByText('Brass')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
    expect(screen.queryByText('Steel')).not.toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('groups tags by category when showByCategory is true', () => {
    render(<SmartTagList tags={['brass', 'defense']} showByCategory={true} />);
    expect(screen.getByText('Material')).toBeInTheDocument();
    expect(screen.getByText('Industry')).toBeInTheDocument();
    expect(screen.getByText('Brass')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
  });
});
