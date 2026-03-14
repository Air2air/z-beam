import { createStaticPage } from '@/app/utils/pages/createStaticPage';
const { generateMetadata, default: NetaluxPage } = createStaticPage('netalux');

export { generateMetadata };

export default NetaluxPage;
