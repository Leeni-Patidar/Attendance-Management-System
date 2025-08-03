import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_management';
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };
  }

  async connect() {
    try {
      console.log('🔄 Connecting to MongoDB...');
      
      const conn = await mongoose.connect(this.mongoURI, this.options);
      
      console.log(`✅ MongoDB connected successfully!`);
      console.log(`📍 Host: ${conn.connection.host}`);
      console.log(`🗄️  Database: ${conn.connection.name}`);
      console.log(`🚀 Ready state: ${conn.connection.readyState}`);
      
      // Setup connection event listeners
      this.setupEventListeners();
      
      return conn;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.handleConnectionError(error);
    }
  }

  setupEventListeners() {
    const db = mongoose.connection;

    db.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    db.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    db.on('disconnected', () => {
      console.log('📤 Mongoose disconnected from MongoDB');
    });

    db.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });

    db.on('timeout', () => {
      console.log('⏰ Mongoose connection timeout');
    });

    db.on('close', () => {
      console.log('🔒 Mongoose connection closed');
    });

    // Handle application termination
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      this.gracefulShutdown('SIGTERM');
    });

    process.on('SIGUSR2', () => {
      this.gracefulShutdown('SIGUSR2');
    });
  }

  async gracefulShutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
    
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed through app termination');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  handleConnectionError(error) {
    if (error.code === 8000) {
      console.error('❌ Authentication failed. Please check your MongoDB credentials.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ MongoDB server not found. Please check your connection string.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused. Please make sure MongoDB is running.');
    } else {
      console.error('❌ Unknown database connection error:', error.message);
    }
    
    // Exit the process in production, but allow retry in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error);
    }
  }

  // Method to check connection status
  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  // Method to get connection info
  getConnectionInfo() {
    const db = mongoose.connection;
    return {
      readyState: db.readyState,
      host: db.host,
      port: db.port,
      name: db.name,
      collections: Object.keys(db.collections),
      models: Object.keys(mongoose.models)
    };
  }

  // Method to setup indexes
  async setupIndexes() {
    try {
      console.log('🔄 Setting up database indexes...');
      
      // Import models to ensure indexes are created
      const models = [
        'User',
        'Session', 
        'Attendance',
        'OverrideLog',
        'DeviceBinding',
        'Subject'
      ];

      for (const modelName of models) {
        const model = mongoose.models[modelName];
        if (model) {
          await model.collection.createIndexes();
          console.log(`✅ Indexes created for ${modelName}`);
        }
      }
      
      console.log('✅ All database indexes setup completed');
    } catch (error) {
      console.error('❌ Error setting up indexes:', error);
    }
  }

  // Method to drop database (use with caution!)
  async dropDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop database in production environment');
    }
    
    try {
      await mongoose.connection.dropDatabase();
      console.log('🗑️  Database dropped successfully');
    } catch (error) {
      console.error('❌ Error dropping database:', error);
      throw error;
    }
  }

  // Method to get database statistics
  async getDatabaseStats() {
    try {
      const admin = mongoose.connection.db.admin();
      const stats = await admin.serverStatus();
      
      return {
        version: stats.version,
        uptime: stats.uptime,
        connections: stats.connections,
        memory: stats.mem,
        storage: stats.storageEngine
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return null;
    }
  }
}

// Create and export database instance
const database = new Database();

export default database;

// Export mongoose for direct access if needed
export { mongoose };