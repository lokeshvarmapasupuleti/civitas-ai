"use client";

import MainLayout from "@/components/layout/MainLayout";
import KpiCards from "@/components/dashboard/KpiCards";
import dynamic from "next/dynamic";
import RecommendationList from "@/components/dashboard/RecommendationList";
import RecentInsights from "@/components/dashboard/RecentInsights";
import ReviewQueue from "@/components/dashboard/ReviewQueue";

const HotspotMap = dynamic(() => import("@/components/dashboard/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-[518px] flex items-center justify-center animate-pulse">
      <div className="text-slate-400 text-lg font-medium">Loading geospatial hotspots...</div>
    </div>
  ),
});


export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            People's Priorities
          </h1>

          <p className="text-slate-400 mt-2">
            AI-powered Constituency Development Planning
          </p>
        </div>

        <KpiCards />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HotspotMap />
          <RecommendationList />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RecentInsights />
          <ReviewQueue />
        </div>
      </div>
    </MainLayout>
  );
}