import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: ComparisonPage } = createStaticPage('comparison');

export { generateMetadata };
export default ComparisonPage;
