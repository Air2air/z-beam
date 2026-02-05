/**
 * Tests for ExpertAnswersPanel component
 * 
 * Verifies:
 * - Expert answer display with Collapsible base
 * - Expert information rendering
 * - Accepted answer badges
 * - Severity indicators
 * - Auto-open first accepted answer
 * - Analytics tracking
 * - Markdown parsing
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpertAnswersPanel } from '../../app/components/ExpertAnswersPanel';
import type { ExpertAnswerItem, ExpertInfo } from '../../app/components/ExpertAnswersPanel';

// Mock Collapsible component
jest.mock('../../app/components/Collapsible', () => ({
  Collapsible: ({ items, sectionMetadata }: any) => (
    <div data-testid="collapsible-mock">
      <h2>{sectionMetadata.sectionTitle}</h2>
      <p>{sectionMetadata.sectionDescription}</p>
      {items.map((item: any, index: number) => (
        <div key={index} data-testid={`item-${index}`}>
          <h3>{item.question}</h3>
          <div data-testid={`answer-${index}`}>{item.answer}</div>
          {item.severity && <span data-testid={`severity-${index}`}>{item.severity}</span>}
          {item.acceptedAnswer && <span data-testid={`auto-open-${index}`}>open</span>}
        </div>
      ))}
    </div>
  )
}));

describe('ExpertAnswersPanel', () => {
  const mockExpert: ExpertInfo = {
    name: 'Dr. Jane Smith',
    credentials: 'PhD Materials Science',
    specialty: 'Laser Cleaning'
  };

  const mockAnswers: ExpertAnswerItem[] = [
    {
      question: 'What are the benefits of laser cleaning?',
      answer: 'Laser cleaning provides precision removal of contaminants without damaging substrate.',
      expert: mockExpert,
      severity: 'low'
    },
    {
      question: 'Is laser cleaning safe for aluminum?',
      answer: 'Yes, laser cleaning is safe for aluminum when proper parameters are used.',
      acceptedAnswer: true,
      severity: 'medium',
      category: 'Safety'
    }
  ];

  describe('Rendering', () => {
    it('should render with expert answers', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      expect(screen.getByText('Expert Answers')).toBeInTheDocument();
      expect(screen.getByText(/Expert insights.*Aluminum/)).toBeInTheDocument();
      expect(screen.getByText('What are the benefits of laser cleaning?')).toBeInTheDocument();
      expect(screen.getByText('Is laser cleaning safe for aluminum?')).toBeInTheDocument();
    });

    it('should render null when no answers provided', () => {
      const { container } = render(
        <ExpertAnswersPanel
          answers={[]}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render null when answers is undefined', () => {
      const { container } = render(
        <ExpertAnswersPanel
          answers={undefined as any}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Expert Information', () => {
    it('should display expert info from answer', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Expert info is embedded in the answer text
      const answerContent = screen.getByTestId('answer-0');
      expect(answerContent.textContent).toContain('Dr. Jane Smith');
      expect(answerContent.textContent).toContain('PhD Materials Science');
    });

    it('should use default expert when answer has no expert', () => {
      const answersWithoutExpert: ExpertAnswerItem[] = [
        {
          question: 'Test question?',
          answer: 'Test answer.'
        }
      ];

      render(
        <ExpertAnswersPanel
          answers={answersWithoutExpert}
          entityName="Aluminum"
          defaultExpert={mockExpert}
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Default expert info is embedded in the answer
      const answerContent = screen.getByTestId('answer-0');
      expect(answerContent.textContent).toContain('Dr. Jane Smith');
    });

    it('should handle missing expert info gracefully', () => {
      const answersWithoutExpert: ExpertAnswerItem[] = [
        {
          question: 'Test question?',
          answer: 'Test answer.'
        }
      ];

      render(
        <ExpertAnswersPanel
          answers={answersWithoutExpert}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Should not crash, expert info section just won't appear
      expect(screen.getByText('Test question?')).toBeInTheDocument();
    });
  });

  describe('Accepted Answer Badge', () => {
    it('should display accepted answer badge', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Accepted answer badge is in the answer text (with markdown)
      const answerContent = screen.getByTestId('answer-1');
      expect(answerContent.textContent).toContain('**Accepted Answer**');
    });

    it('should auto-open first accepted answer', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Second item is accepted, should be auto-opened
      expect(screen.getByTestId('auto-open-1')).toBeInTheDocument();
      expect(screen.queryByTestId('auto-open-0')).not.toBeInTheDocument();
    });

    it('should auto-open first item if no accepted answers', () => {
      const answersWithoutAccepted: ExpertAnswerItem[] = [
        {
          question: 'Question 1?',
          answer: 'Answer 1.'
        },
        {
          question: 'Question 2?',
          answer: 'Answer 2.'
        }
      ];

      render(
        <ExpertAnswersPanel
          answers={answersWithoutAccepted}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // First item should be auto-opened by default
      expect(screen.getByTestId('auto-open-0')).toBeInTheDocument();
      expect(screen.queryByTestId('auto-open-1')).not.toBeInTheDocument();
    });
  });

  describe('Severity Indicators', () => {
    it('should pass severity to collapsible items', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      expect(screen.getByTestId('severity-0')).toHaveTextContent('low');
      expect(screen.getByTestId('severity-1')).toHaveTextContent('medium');
    });

    it('should handle missing severity gracefully', () => {
      const answersWithoutSeverity: ExpertAnswerItem[] = [
        {
          question: 'Test question?',
          answer: 'Test answer.'
        }
      ];

      render(
        <ExpertAnswersPanel
          answers={answersWithoutSeverity}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Should not crash, severity just won't appear
      expect(screen.queryByTestId('severity-0')).not.toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    it('should display category when present', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      // Category is in the answer text (with markdown)
      const answerContent = screen.getByTestId('answer-1');
      expect(answerContent.textContent).toContain('**Category:** Safety');
    });
  });

  describe('Content Formatting', () => {
    it('should include expert info, badge, category, and answer in content', () => {
      render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      const firstItem = screen.getByTestId('item-0');
      
      // Check all parts are present in description for first item
      expect(firstItem.textContent).toContain('Dr. Jane Smith');
      expect(firstItem.textContent).toContain('PhD Materials Science');
      expect(firstItem.textContent).toContain('Laser cleaning provides precision');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ExpertAnswersPanel
          answers={mockAnswers}
          entityName="Aluminum"
          className="custom-class"
          sectionMetadata={{
            sectionTitle: 'Expert Answers',
            sectionDescription: 'Expert insights and recommendations for Aluminum laser cleaning'
          }}
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
