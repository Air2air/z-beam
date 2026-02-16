// Safety page using createStaticPage factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: SafetyPage } = createStaticPage('safety');

export { generateMetadata };
export default SafetyPage;
