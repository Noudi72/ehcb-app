import React, { useState, useEffect } from "react";
import { users, teams } from "../config/supabase-api";

export default function PendingRegistrations({ onUpdate }) {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const teamOptions = [
    { id: "u16-elit", name: "U16-Elit" },
    { id: "u18-elit", name: "U18-Elit" },
    { id: "u21-elit", name: "U21-Elit" }
  ];

  useEffect(() => {
    fetchPendingUsers();
    fetchTeams();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const pendingUsersData = await users.getPending();
      setPendingUsers(pendingUsersData.filter(u => u.role === "player"));
    } catch (err) {
      setError("Fehler beim Laden der ausstehenden Registrierungen");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsData = await teams.getAll();
      setTeams(teamsData);
    } catch (err) {
      console.error("Fehler beim Laden der Teams:", err);
      // Fallback auf Standard-Teams wenn Supabase Teams noch nicht vorhanden
      setTeams(teamOptions);
    }
  };

  const handleApprove = async (userId, selectedTeams) => {
    if (selectedTeams.length === 0) {
      alert("Bitte wähle mindestens ein Team aus.");
      return;
    }

    try {
      await users.update(userId, {
        status: "approved",
        active: true,
        teams: selectedTeams,
        approved_at: new Date().toISOString()
      });

      // Aktualisiere die lokale Liste
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      // Informiere das Dashboard über die Änderung
      if (onUpdate) onUpdate();
      
      // Hier könnte eine Benachrichtigung an den Spieler gesendet werden
      alert("Spieler wurde erfolgreich genehmigt und den Teams zugewiesen!");

    } catch (err) {
      setError("Fehler beim Genehmigen: " + err.message);
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Möchtest du diese Registrierung wirklich ablehnen?")) {
      return;
    }

    try {
      await users.update(userId, {
        status: "rejected",
        active: false,
        rejected_at: new Date().toISOString()
      });

      // Aktualisiere die lokale Liste
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      // Informiere das Dashboard über die Änderung
      if (onUpdate) onUpdate();
      
      alert("Registrierung wurde abgelehnt.");

    } catch (err) {
      setError("Fehler beim Ablehnen: " + err.message);
    }
  };

  const TeamSelector = ({ user, onApprove }) => {
    const [selectedTeams, setSelectedTeams] = useState([]);

    const handleTeamChange = (teamId) => {
      const updatedTeams = selectedTeams.includes(teamId)
        ? selectedTeams.filter(id => id !== teamId)
        : [...selectedTeams, teamId];
      
      setSelectedTeams(updatedTeams);
    };

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
        <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Team-Zuordnung für {user.name}</h4>
        
        <div className="space-y-2 mb-4">
          {teamOptions.map(team => (
            <label key={team.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTeams.includes(team.id)}
                onChange={() => handleTeamChange(team.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{team.name}</span>
            </label>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => onApprove(user.id, selectedTeams)}
            disabled={selectedTeams.length === 0}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
          >
            Genehmigen
          </button>
          
          <button
            onClick={() => handleReject(user.id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-sm font-medium transition-colors"
          >
            Ablehnen
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Ausstehende Registrierungen
          {pendingUsers.length > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
              {pendingUsers.length}
            </span>
          )}
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Keine ausstehenden Registrierungen</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Alle Spieler sind bereits genehmigt oder abgelehnt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user) => (
            <div key={user.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{user.name}</h4>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Username: {user.username}</p>
                    {user.playerNumber && <p>Trikotnummer: {user.playerNumber}</p>}
                    <p>Registriert: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Ausstehend
                </span>
              </div>

              <TeamSelector user={user} onApprove={handleApprove} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
