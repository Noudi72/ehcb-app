import React from "react";
import SurveyManagerOverview from "./SurveyManagerOverview";

export default function SurveyOverviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <main className="flex-1 container mx-auto p-8">
        <SurveyManagerOverview />
      </main>
    </div>
  );
}
