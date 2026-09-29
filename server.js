import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and listen
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Shutter & Stripes API] Server running on port ${PORT}`);
    console.log(`[Health Endpoint] http://localhost:${PORT}/api/health`);
  });
});
