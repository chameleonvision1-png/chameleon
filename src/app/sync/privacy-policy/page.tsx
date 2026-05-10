import { Metadata } from 'next';
import PrivacyPolicyClient from '@/components/sync/PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use | SYNC',
  description: 'Privacy Policy and Terms of Use for SYNC Platform',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
