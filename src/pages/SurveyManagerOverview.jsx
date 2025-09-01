import React from "react";
import { useUmfrage } from "../context/UmfrageContext";

function StatusBadge({ status }) {
  const color = {
    draft: "bg-gray-300 text-gray-800",
    active: "bg-green-200 text-green-800",
    archived: "bg-yellow-200 text-yellow-800",
  }[status] || "bg-gray-100 text-gray-600";
  const label = {
    draft: "Entwurf",
    active: "Aktiv",
    archived: "Archiviert",
  }[status] || status;
  return <span className={`px-2 py-1 rounded ${color}`}>{label}</span>;
}

function SurveyActions({ survey, onEdit, onPublish, onArchive, onViewResults }) {
  return (
    <div className="flex gap-2">
      {(survey.status === "draft" || survey.status === "archived") && (
        <button className="btn" onClick={() => onEdit(survey.id)}>Bearbeiten</button>
      )}
      {survey.status === "draft" && (
        <button className="btn btn-green" onClick={() => onPublish(survey.id)}>Veröffentlichen</button>
      )}
      {survey.status === "active" && (
        <>
          <button className="btn btn-yellow" onClick={() => onArchive(survey.id)}>Archivieren</button>
          <button className="btn btn-blue" onClick={() => onViewResults(survey.id)}>Ergebnisse ansehen</button>
        </>
      )}
    </div>
  );
}

export default function SurveyManagerOverview() {
  const { surveys = [], updateSurvey } = useUmfrage();

  // Handler für Aktionen
  const handleEdit = (id) => {
    window.location.href = `/coach/survey-editor?id=${id}`;
  };
  const handlePublish = (id) => {
    const survey = surveys.find(s => s.id === id);
    if (survey) updateSurvey(id, { ...survey, status: "active" });
  };
  const handleArchive = (id) => {
    const survey = surveys.find(s => s.id === id);
    if (survey) updateSurvey(id, { ...survey, status: "archived" });
  };
  const handleViewResults = (id) => {
    window.location.href = `/umfrage-results?id=${id}`;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Umfrageverwaltung</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map(survey => (
          <div key={survey.id} className="rounded-lg shadow-md p-6 bg-white border-b-4 border-transparent hover:border-blue-500 transition-all">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold flex items-center">
                {survey.title}
                <span className="ml-2"><StatusBadge status={survey.status} /></span>
              </h2>
            </div>
            {survey.description && (
              <p className="mb-3 text-gray-600 text-sm">{survey.description}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <SurveyActions 
                survey={survey} 
                onEdit={handleEdit} 
                onPublish={handlePublish} 
                onArchive={handleArchive} 
                onViewResults={handleViewResults}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
