const mongoose = require('mongoose');

// Get MongoDB connection string from environment variables
const mongo_url = process.env.MONGO_CONN;

// Log connection status (but hide credentials)
console.log('MongoDB Connection URL defined:', mongo_url ? 'Yes' : 'No');

if (!mongo_url) {
  console.error('MONGODB connection string is missing! Check your .env file.');
  // Throw error to prevent the app from starting without a valid DB connection
  throw new Error('MongoDB connection string is required. Check .env file for MONGO_CONN variable.');
}

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB
mongoose.connect(mongo_url, options)
  .then(() => {
    console.log('MONGODB IS CONNECTED SUCCESSFULLY!');
  })
  .catch((error) => {
    console.error(`MONGODB connection error:`, error);
    // Optionally exit the process on connection failure
    // process.exit(1);
  });

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected!');
});

// Handle application termination - close DB connection
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

