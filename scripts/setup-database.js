#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script initializes the database and creates all necessary tables.
 * Run this script before starting the application for the first time.
 * 
 * Usage:
 *   node scripts/setup-database.js
 */

require('dotenv').config();
const { initializeDatabase, testConnection } = require('../config/database');

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful\n');

    // Initialize database (create tables, default data)
    console.log('🔧 Initializing database...');
    await initializeDatabase();
    console.log('✅ Database initialization completed\n');

    console.log('🎉 Database setup completed successfully!');
    console.log('📝 You can now start the application with: npm start');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Make sure PostgreSQL is running');
    console.error('2. Check your database credentials in .env file');
    console.error('3. Ensure the database exists');
    console.error('4. Verify network connectivity');
    
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
