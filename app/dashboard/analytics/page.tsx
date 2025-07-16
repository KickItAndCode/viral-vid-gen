"use client";

import { Breadcrumb } from "@/components/layout";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <AnalyticsDashboard />
    </div>
  );
}
