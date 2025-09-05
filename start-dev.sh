#!/bin/bash

echo "🚀 Starting EHCB Development Environment..."

# Function to kill existing processes
cleanup() {
    echo "🧹 Cleaning up existing processes..."
    pkill -f "json-server" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    sleep 2
}

# Function to start JSON server
start_json_server() {
    echo "📊 Starting JSON Server on port 3001..."
    npx json-server --watch db.json --port 3001 --host 0.0.0.0 &
    JSON_PID=$!
    sleep 3
    
    # Check if JSON server started successfully
    if curl -s http://localhost:3001/surveys > /dev/null; then
        echo "✅ JSON Server started successfully (PID: $JSON_PID)"
    else
        echo "❌ JSON Server failed to start"
        exit 1
    fi
}

# Function to start Vite
start_vite() {
    echo "⚡ Starting Vite Dev Server on port 5174..."
    npm run dev &
    VITE_PID=$!
    sleep 5
    
    # Check if Vite started successfully
    if curl -s http://localhost:5174 > /dev/null; then
        echo "✅ Vite Dev Server started successfully (PID: $VITE_PID)"
    else
        echo "❌ Vite Dev Server failed to start"
        exit 1
    fi
}

# Cleanup existing processes
cleanup

# Start both servers
start_json_server
start_vite

echo ""
echo "🎉 Development environment is ready!"
echo "📊 JSON Server: http://localhost:3001"
echo "⚡ Vite App: http://localhost:5174"
echo "🏒 Mental Game Survey: http://localhost:5174/coach/survey-editor/mental-game"
echo ""
echo "Press Ctrl+C to stop all servers"

# Keep script running and monitor processes
while true; do
    sleep 10
    
    # Check JSON Server
    if ! curl -s http://localhost:3001/surveys > /dev/null; then
        echo "⚠️ JSON Server died, restarting..."
        start_json_server
    fi
    
    # Check Vite
    if ! curl -s http://localhost:5174 > /dev/null; then
        echo "⚠️ Vite died, restarting..."
        start_vite
    fi
done
