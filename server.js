import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Start listening immediately on 0.0.0.0 so Render detects open port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Shutter & Stripes API] Server running on port ${PORT}`);
  console.log(`[Health Endpoint] http://localhost:${PORT}/api/health`);
});

// Connect to MongoDB Atlas
connectDB();
