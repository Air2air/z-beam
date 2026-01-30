// app/services/page.tsx - Redirect to rental page
import { redirect } from 'next/navigation';

export default function ServicesPage() {
  redirect('/rental');
}
