import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: ThankYouPage } = createStaticPage('thank-you');

export { generateMetadata };
export default ThankYouPage;
