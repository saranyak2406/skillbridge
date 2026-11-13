const dotenv = require('dotenv');
const path = require('path');

// Handle uncaught exceptions before loading app
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 SkillBridge Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('====================================================');

  // Verify database connectivity
  await testConnection();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down server...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle graceful termination signals
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('💥 Process terminated.');
  });
});
