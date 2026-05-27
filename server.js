const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/phone.html');
});

const ROOMS = {
  phone: 'phone',
  laptop: 'laptop'
};

function normalizeCommand(raw) {
  if (!raw) return '';
  const text = String(raw).toLowerCase().trim();

  if (/\breset\b/.test(text)) return 'reset';
  if (/\bnext\b/.test(text)) return 'next';
  if (/\bdown\b/.test(text)) return 'down';
  if (/\bup\b/.test(text)) return 'up';

  return '';
}

function now() {
  return new Date().toISOString();
}

io.on('connection', (socket) => {
  socket.data.role = 'unknown';
  socket.data.mode = 'unknown';
  socket.data.clientName = 'unknown';

  socket.on('register-device', (payload = {}) => {
    const role = payload.role === 'laptop' ? 'laptop' : 'phone';
    socket.data.role = role;
    socket.data.mode = payload.mode || 'unknown';
    socket.data.clientName = payload.clientName || role;

    socket.join(ROOMS[role]);

    io.to(ROOMS[role]).emit('status-update', {
      role,
      status: 'terhubung',
      mode: socket.data.mode,
      time: now()
    });

    socket.emit('registered', {
      ok: true,
      role,
      mode: socket.data.mode,
      socketId: socket.id,
      time: now()
    });

    const otherRoom = role === 'phone' ? ROOMS.laptop : ROOMS.phone;
    io.to(otherRoom).emit('peer-status', {
      peer: role,
      status: 'terhubung',
      time: now()
    });
  });

  socket.on('select-mode', (payload = {}) => {
    socket.data.mode = payload.mode || socket.data.mode || 'unknown';
    const role = socket.data.role || 'unknown';
    if (role !== 'unknown') {
      io.to(ROOMS[role]).emit('status-update', {
        role,
        status: 'mode-dipilih',
        mode: socket.data.mode,
        time: now()
      });
    }
    socket.emit('mode-ack', {
      ok: true,
      mode: socket.data.mode,
      time: now()
    });
  });

  socket.on('voice-command', (payload = {}) => {
    const role = socket.data.role;
    if (role !== 'phone') {
      socket.emit('error-message', {
        message: 'voice-command hanya boleh dikirim dari halaman HP.'
      });
      return;
    }

    const command = normalizeCommand(payload.command);
    if (!command) {
      socket.emit('command-ignored', {
        reason: 'Perintah tidak dikenali.',
        original: payload.command || ''
      });
      return;
    }

    const data = {
      command,
      transcript: payload.transcript || '',
      mode: payload.mode || socket.data.mode || 'unknown',
      source: 'phone',
      time: now()
    };

    io.to(ROOMS.laptop).emit('command', data);
    socket.emit('command-delivered', data);
  });

  socket.on('manual-command', (payload = {}) => {
    const role = socket.data.role;
    if (role !== 'laptop') return;

    const command = normalizeCommand(payload.command);
    if (!command) return;

    io.to(ROOMS.laptop).emit('command', {
      command,
      transcript: payload.command,
      mode: socket.data.mode || 'unknown',
      source: 'manual',
      time: now()
    });
  });

  socket.on('disconnect', () => {
    const role = socket.data.role;
    if (role === 'phone' || role === 'laptop') {
      io.to(ROOMS[role]).emit('status-update', {
        role,
        status: 'putus',
        mode: socket.data.mode || 'unknown',
        time: now()
      });
      const otherRoom = role === 'phone' ? ROOMS.laptop : ROOMS.phone;
      io.to(otherRoom).emit('peer-status', {
        peer: role,
        status: 'putus',
        time: now()
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Voice command local server running on http://localhost:${PORT}`);
});
