// app/property/page.tsx
// Basic property listing page

import { CONTAINER_STYLES } from "../utils/containerStyles";

export default function PropertyPage() {
  return (
    <div className={CONTAINER_STYLES.standard}>
      <h1 className="text-3xl font-bold mb-6">Material Properties</h1>
      <p className="text-gray-600">
        Property search functionality is currently under development.
      </p>
    </div>
  );
}