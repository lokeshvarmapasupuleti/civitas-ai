"use client";

import MainLayout from "@/components/layout/MainLayout";
import dynamic from "next/dynamic";
import RequestTrendChart from "@/components/dashboard/RequestTrendChart";

const HotspotMap = dynamic(() => import("@/components/dashboard/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-[518px] flex items-center justify-center animate-pulse">
      <div className="text-slate-400 text-lg font-medium">Loading geospatial hotspots...</div>
    </div>
  ),
});

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Demand Analytics</h1>
          <p className="text-slate-400 mt-2">
            Geospatial visualization of citizen development requests and infrastructure gaps alongside monthly trends.
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HotspotMap />
          <RequestTrendChart />
        </div>
      </div>
    </MainLayout>
  );
}