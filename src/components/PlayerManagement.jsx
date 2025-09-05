import React, { useState, useEffect } from "react";
import { users } from "../config/supabase-api";

export default function PlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const availableTeams = [
    { id: "u16-elit", name: "U16-Elit" },
    { id: "u18-elit", name: "U18-Elit" },
    { id: "u21-elit", name: "U21-Elit" }
  ];

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const allUsers = await users.getAll();
      const playerUsers = allUsers.filter(user => user.role === "player");
      setPlayers(playerUsers);
    } catch (err) {
      console.error("❌ Failed to load players:", err);
      setError("Fehler beim Laden der Spieler");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer({
      ...player,
      teams: player.teams || []
    });
    setShowEditModal(true);
  };

  const handleSavePlayer = async () => {
    if (!editingPlayer) return;

    try {
      const updatedPlayer = await users.update(editingPlayer.id, {
        name: editingPlayer.name,
        teams: editingPlayer.teams,
        active: editingPlayer.active
      });

      setPlayers(players.map(p => 
        p.id === editingPlayer.id ? updatedPlayer : p
      ));
      
      setShowEditModal(false);
      setEditingPlayer(null);
    } catch (err) {
      console.error("❌ Failed to update player:", err);
      setError("Fehler beim Aktualisieren des Spielers");
    }
  };

  const handleDeletePlayer = async (playerId) => {
    if (!confirm("Möchten Sie diesen Spieler wirklich löschen?")) return;

    try {
      await users.delete(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (err) {
      console.error("❌ Failed to delete player:", err);
      setError("Fehler beim Löschen des Spielers");
    }
  };

  const handleTogglePlayerStatus = async (player) => {
    try {
      const updatedPlayer = await users.update(player.id, {
        active: !player.active
      });

      setPlayers(players.map(p => 
        p.id === player.id ? updatedPlayer : p
      ));
    } catch (err) {
      console.error("❌ Failed to toggle player status:", err);
      setError("Fehler beim Ändern des Spielerstatus");
    }
  };

  const handleTeamChange = (teamId) => {
    if (!editingPlayer) return;

    const newTeams = editingPlayer.teams.includes(teamId)
      ? editingPlayer.teams.filter(id => id !== teamId)
      : [...editingPlayer.teams, teamId];

    setEditingPlayer({
      ...editingPlayer,
      teams: newTeams
    });
  };

  const getTeamNames = (teamIds) => {
    if (!teamIds || teamIds.length === 0) return "Keine Teams";
    return teamIds.map(id => 
      availableTeams.find(team => team.id === id)?.name || id
    ).join(", ");
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-center">Lade Spieler...</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">👥 Spielerverwaltung</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Teams</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Registriert</th>
              <th className="px-4 py-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {players.map(player => (
              <tr key={player.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{player.name}</td>
                <td className="px-4 py-2 text-sm">{getTeamNames(player.teams)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    player.active !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {player.active !== false ? 'Aktiv' : 'Offline'}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-500">
                  {player.created_at ? new Date(player.created_at).toLocaleDateString('de-DE') : '-'}
                </td>
                <td className="px-4 py-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditPlayer(player)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      ✏️ Bearbeiten
                    </button>
                    <button
                      onClick={() => handleTogglePlayerStatus(player)}
                      className={`px-3 py-1 rounded text-sm ${
                        player.active !== false
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {player.active !== false ? '⏸️ Offline' : '▶️ Aktivieren'}
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {players.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Keine Spieler gefunden.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Spieler bearbeiten</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Teams</label>
                <div className="space-y-2">
                  {availableTeams.map(team => (
                    <label key={team.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingPlayer.teams.includes(team.id)}
                        onChange={() => handleTeamChange(team.id)}
                        className="mr-2"
                      />
                      {team.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPlayer.active !== false}
                    onChange={(e) => setEditingPlayer({...editingPlayer, active: e.target.checked})}
                    className="mr-2"
                  />
                  Spieler ist aktiv
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSavePlayer}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
