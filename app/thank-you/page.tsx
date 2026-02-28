import { createStaticPage } from '@/app/utils/pages/createStaticPage';
import ThankYouConversionTracker from './ThankYouConversionTracker';

const { generateMetadata, default: ThankYouPage } = createStaticPage('thank-you');

export { generateMetadata };

export default function ThankYouPageWithTracking() {
	return (
		<>
			<ThankYouConversionTracker />
			<ThankYouPage />
		</>
	);
}
