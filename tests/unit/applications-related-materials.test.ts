import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

describe('Applications frontmatter relatedMaterials schema', () => {
  const applicationsDir = path.join(process.cwd(), 'frontmatter', 'applications');

  it('removes item-level relatedMaterials.description across all application entries', () => {
    const files = fs
      .readdirSync(applicationsDir)
      .filter((file) => file.endsWith('.yaml'));

    let relatedMaterialsEntries = 0;

    for (const file of files) {
      const filePath = path.join(applicationsDir, file);
      const parsed = (yaml.load(fs.readFileSync(filePath, 'utf8')) || {}) as any;

      const items =
        parsed?.relationships?.discovery?.relatedMaterials?.items || [];

      if (!Array.isArray(items) || items.length === 0) {
        continue;
      }

      relatedMaterialsEntries += 1;

      for (const item of items) {
        expect(item.description).toBeUndefined();
      }
    }

    expect(relatedMaterialsEntries).toBeGreaterThan(0);
  });

  it('removes item-level interactions.contaminatedBy.description across all application entries', () => {
    const files = fs
      .readdirSync(applicationsDir)
      .filter((file) => file.endsWith('.yaml'));

    let contaminatedByEntries = 0;

    for (const file of files) {
      const filePath = path.join(applicationsDir, file);
      const parsed = (yaml.load(fs.readFileSync(filePath, 'utf8')) || {}) as any;

      const items =
        parsed?.relationships?.interactions?.contaminatedBy?.items || [];

      if (!Array.isArray(items) || items.length === 0) {
        continue;
      }

      contaminatedByEntries += 1;

      for (const item of items) {
        expect(item.description).toBeUndefined();
      }
    }

    expect(contaminatedByEntries).toBeGreaterThan(0);
  });

  it('replaces generic sectionDescription placeholders in applications relationships', () => {
    const files = fs
      .readdirSync(applicationsDir)
      .filter((file) => file.endsWith('.yaml'));

    const genericRelatedMaterials = 'Materials most frequently cleaned in this application context.';
    const genericContaminatedBy = 'Contaminants typically removed in these applications.';

    for (const file of files) {
      const filePath = path.join(applicationsDir, file);
      const parsed = (yaml.load(fs.readFileSync(filePath, 'utf8')) || {}) as any;

      const relatedMaterialsSection = parsed?.relationships?.discovery?.relatedMaterials?._section;
      const contaminatedBySection = parsed?.relationships?.interactions?.contaminatedBy?._section;

      if (relatedMaterialsSection?.sectionDescription) {
        expect(relatedMaterialsSection.sectionDescription).not.toBe(genericRelatedMaterials);
      }

      if (contaminatedBySection?.sectionDescription) {
        expect(contaminatedBySection.sectionDescription).not.toBe(genericContaminatedBy);
      }
    }
  });
});
