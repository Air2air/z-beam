// About page using centralized static page factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: AboutPage } = createStaticPage('about');

export { generateMetadata };
export default AboutPage;
