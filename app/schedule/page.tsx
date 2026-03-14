import { createStaticPage } from '@/app/utils/pages/createStaticPage';

const { generateMetadata, default: SchedulePage } = createStaticPage('schedule');

export { generateMetadata };
export default SchedulePage;
