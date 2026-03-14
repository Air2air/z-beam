import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: ContactPage } = createStaticPage('contact');

export { generateMetadata };
export default ContactPage;
