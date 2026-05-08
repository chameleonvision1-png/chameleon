import React from 'react';
import SyncHero from '@/components/sync/SyncHero';
import SyncToolsGrid from '@/components/sync/SyncToolsGrid';
import SyncHowItWorks from '@/components/sync/SyncHowItWorks';
import SyncWhy from '@/components/sync/SyncWhy';
import SyncFAQ from '@/components/sync/SyncFAQ';
import GraffitiBackground from '@/components/sync/GraffitiBackground';

export default function SyncHomePage() {
  return (
    <div className="relative w-full overflow-hidden">
      <GraffitiBackground />
      <SyncHero />
      <SyncToolsGrid />
      <SyncHowItWorks />
      <SyncWhy />
      <SyncFAQ />
    </div>
  );
}
