// Partners page using centralized static page factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: PartnersPage } = createStaticPage('partners');

export { generateMetadata };
export default PartnersPage;
