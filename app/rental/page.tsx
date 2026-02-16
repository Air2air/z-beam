// Rental page using centralized static page factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: RentalPage } = createStaticPage('rental');

export { generateMetadata };
export default RentalPage;
