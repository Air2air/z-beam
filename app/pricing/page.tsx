import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: PricingPage } = createStaticPage('pricing');

export { generateMetadata };
export default PricingPage;