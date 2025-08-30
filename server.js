// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// CORS-Middleware
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Standard-Middleware
server.use(middlewares);

// Router verwenden
server.use(router);

// Server starten
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server läuft auf http://localhost:${PORT}`);
});
