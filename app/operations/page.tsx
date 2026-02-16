// Operations page using centralized static page factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: OperationsPage } = createStaticPage('operations');

export { generateMetadata };
export default OperationsPage;
