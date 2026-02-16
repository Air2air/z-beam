// Equipment page using createStaticPage factory
import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: EquipmentPage } = createStaticPage('equipment');

export { generateMetadata };
export default EquipmentPage;
