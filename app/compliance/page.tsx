// Compliance page using centralized static page factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: CompliancePage } = createStaticPage('compliance');

export { generateMetadata };
export default CompliancePage;