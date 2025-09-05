#!/bin/bash

# EHCB App Server Monitor
# Überwacht beide Server und startet sie automatisch neu wenn sie abstürzen

LOG_FILE="server-monitor.log"
RESTART_COUNT=0

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_server() {
    local port=$1
    local name=$2
    
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

start_servers() {
    log_message "🚀 Starting EHCB servers..."
    
    # Stoppe existierende Prozesse
    pkill -f "json-server" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    sleep 3
    
    # Starte JSON Server
    nohup npx json-server --watch db.json --port 3001 --host 0.0.0.0 > json-server.log 2>&1 &
    JSON_PID=$!
    log_message "📊 JSON Server started (PID: $JSON_PID)"
    
    # Warte kurz
    sleep 2
    
    # Starte Vite
    nohup npm run dev > vite-server.log 2>&1 &
    VITE_PID=$!
    log_message "⚡ Vite Server started (PID: $VITE_PID)"
    
    # Warte auf Server startup
    sleep 5
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    log_message "✅ Servers started (Restart #$RESTART_COUNT)"
}

main() {
    log_message "🔍 EHCB Server Monitor gestartet"
    
    # Initiale Server-Start
    start_servers
    
    while true; do
        sleep 10  # Check alle 10 Sekunden
        
        # Überprüfe JSON Server
        if ! check_server 3001 "JSON Server"; then
            log_message "❌ JSON Server ist offline - restarting..."
            start_servers
            continue
        fi
        
        # Überprüfe Vite Server
        if ! check_server 5174 "Vite Server"; then
            log_message "❌ Vite Server ist offline - restarting..."
            start_servers
            continue
        fi
        
        # Status OK
        if [ $(($(date +%s) % 60)) -eq 0 ]; then  # Jede Minute
            log_message "✅ Beide Server laufen (JSON:3001, Vite:5174)"
        fi
    done
}

# Signal Handler für sauberes Beenden
cleanup() {
    log_message "🛑 Monitor wird beendet..."
    pkill -f "json-server" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Starte Monitor
main
