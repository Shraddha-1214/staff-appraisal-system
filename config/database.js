// config/database.js
module.exports = {
  // This tells the app to use the link from your .env file
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/staff-db'
};