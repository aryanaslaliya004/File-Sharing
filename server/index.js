const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define User Schema & Model
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate a display ID (same logic as before)
    const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = `${name.toUpperCase().slice(0, 5)}-${uniqueSuffix}`;

    const newUser = new User({ id, name, phone, email, password });
    await newUser.save();

    res.json({ success: true, user: { id, username: name, email, phone } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({ success: true, user: { id: user.id, username: user.name, email: user.email, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email, password: currentPassword });
    if (!user) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API Key missing');
      return res.status(500).json({ error: 'Gemini API Key is not configured on the server. Please add it to your .env file.' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Switching to 1.5-flash which is more robust and has higher free tier quotas usually
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a helpful, concise, and friendly support assistant for "FileShare", a local P2P WebRTC file-sharing web application.
    The app has features like: Connecting via QR Code or Peer ID, transferring files/folders/apps, saving transfer history, logging in/out, changing passwords, and a responsive dark/light theme.
    Please answer the user's question directly and concisely without complex markdown formatting (just plain text is best for the chat window, though basic newlines are fine).
    
    User Question: "${message}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error('Empty response from AI');

    res.json({ reply: text });
  } catch (error) {
    console.error('Gemini chat error status:', error.status);
    console.error('Gemini chat error message:', error.message);
    
    // Fallback logic for when AI is unavailable (e.g. 429 quota issues)
    const { message } = req.body;
    let fallbackReply = null;
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('share') || lowerMsg.includes('transfer') || lowerMsg.includes('send')) {
      fallbackReply = "To share files, first connect to another device via QR Code or Peer ID. Once in a 'Room', use the 'Send File' or 'Send Folder' buttons to select and transfer items instantly!";
    } else if (lowerMsg.includes('connect') || lowerMsg.includes('qr') || lowerMsg.includes('id')) {
      fallbackReply = "You can connect by going to the 'Connect' page. One device should show its QR code, and the other should scan it. Alternatively, you can manually enter the Peer ID shown on the screen.";
    } else if (lowerMsg.includes('history')) {
      fallbackReply = "The 'History' page tracks all your previous successful transfers, including filenames, sizes, and the peer you shared with.";
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('who are you')) {
      fallbackReply = "Hi there! I'm the FileShare assistant. I can help you with questions about sharing files, connecting devices, or using your dashboard. How can I help today?";
    } else if (lowerMsg.includes('secure') || lowerMsg.includes('privacy') || lowerMsg.includes('webrtc')) {
      fallbackReply = "FileShare uses WebRTC for direct Peer-to-Peer transfers. This means your files go directly from one device to another without being stored on any server, making it extremely secure and private.";
    }

    if (fallbackReply) {
      console.log('Using fallback reply due to AI error');
      return res.json({ reply: fallbackReply, isFallback: true });
    }

    let errorMsg = 'Failed to contact AI support. ';
    if (error.message && error.message.includes('429')) {
      errorMsg += 'Rate limit exceeded (429). Please check your API quota or try again in a moment.';
    } else {
      errorMsg += error.message || '';
    }
    res.status(500).json({ error: errorMsg });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for now, tighten for prod
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    // Join a room with their own ID to receive direct messages
    socket.join(userId);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('offer', (data) => {
    const { target, offer, sender } = data;
    io.to(target).emit('offer', { offer, sender });
  });

  socket.on('answer', (data) => {
    const { target, answer, sender } = data;
    io.to(target).emit('answer', { answer, sender });
  });

  socket.on('ice-candidate', (data) => {
    const { target, candidate, sender } = data;
    io.to(target).emit('ice-candidate', { candidate, sender });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? 'YES (starts with ' + process.env.GEMINI_API_KEY.substring(0, 5) + '...)' : 'NO');
});
