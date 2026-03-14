import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import {
  isValidHomeFeaturedSection,
  HomeFeaturedSectionSchema,
} from '@/schemas/static-page-content';

describe('Homepage Featured Sections', () => {
  const homeYamlPath = path.join(process.cwd(), 'app', 'page.yaml');

  it('validates featured section schema requirements are explicit', () => {
    expect(HomeFeaturedSectionSchema.required).toEqual([
      'slug',
      'title',
      'description',
      'imageUrl',
    ]);
  });

  it('contains Industry Applications card targeting /applications', () => {
    const yamlContent = fs.readFileSync(homeYamlPath, 'utf8');
    const homeConfig = yaml.load(yamlContent) as any;

    expect(Array.isArray(homeConfig.featuredSections)).toBe(true);

    const applicationsCard = homeConfig.featuredSections.find(
      (section: any) => section.slug === 'applications'
    );

    expect(applicationsCard).toBeDefined();
    expect(isValidHomeFeaturedSection(applicationsCard)).toBe(true);
    expect(applicationsCard.title).toBe('Industry Applications');
    expect(`/${applicationsCard.slug}`).toBe('/applications');
  });

  it('does not include the retired services featured card slug', () => {
    const yamlContent = fs.readFileSync(homeYamlPath, 'utf8');
    const homeConfig = yaml.load(yamlContent) as any;

    const hasServicesCard = homeConfig.featuredSections.some(
      (section: any) => section.slug === 'services'
    );

    expect(hasServicesCard).toBe(false);
  });
});
