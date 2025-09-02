// MongoDB Service für EHCB App
import { MongoClient } from 'mongodb';

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }

      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db('ehcb-app');
      this.isConnected = true;
      
      console.log('✅ MongoDB Atlas connected successfully');
      
      // Initiale Daten einfügen falls Sammlungen leer sind
      await this.initializeData();
      
      return this.db;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('MongoDB connection closed');
    }
  }

  getDb() {
    if (!this.isConnected || !this.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.db;
  }

  async initializeData() {
    try {
      const db = this.getDb();

      // Teams initialisieren
      const teamsCount = await db.collection('teams').countDocuments();
      if (teamsCount === 0) {
        await db.collection('teams').insertMany([
          { _id: 'u16-elit', name: 'U16-Elit', description: 'Nachwuchsteam U16-Elit' },
          { _id: 'u18-elit', name: 'U18-Elit', description: 'Nachwuchsteam U18-Elit' },
          { _id: 'u21-elit', name: 'U21-Elit', description: 'Nachwuchsteam U21-Elit' }
        ]);
        console.log('🏒 Teams initialized');
      }

      // Coach User initialisieren
      const usersCount = await db.collection('users').countDocuments();
      if (usersCount === 0) {
        await db.collection('users').insertOne({
          _id: 'coach1',
          username: 'coach',
          password: 'Coach7274',
          role: 'coach',
          name: 'Trainer',
          active: true,
          teams: ['u18-elit'],
          createdAt: new Date()
        });
        console.log('👨‍💼 Coach user initialized');
      }

      // Sport Food Categories initialisieren
      const categoriesCount = await db.collection('sport-food-categories').countDocuments();
      if (categoriesCount === 0) {
        await db.collection('sport-food-categories').insertMany([
          { _id: 'cat1', name: 'Vor dem Training', description: 'Empfohlene Nahrungsmittel vor dem Training' },
          { _id: 'cat2', name: 'Während dem Training', description: 'Empfohlene Nahrungsmittel während dem Training' },
          { _id: 'cat3', name: 'Nach dem Training', description: 'Empfohlene Nahrungsmittel nach dem Training' },
          { _id: 'cat4', name: 'Vor dem Spiel', description: 'Empfohlene Nahrungsmittel vor dem Spiel' },
          { _id: 'cat5', name: 'Nach dem Spiel', description: 'Empfohlene Nahrungsmittel nach dem Spiel' }
        ]);
        console.log('🥗 Sport food categories initialized');
      }

    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }

  // Helper-Methoden für CRUD Operations
  async findAll(collection, filter = {}) {
    const db = this.getDb();
    return await db.collection(collection).find(filter).toArray();
  }

  async findById(collection, id) {
    const db = this.getDb();
    return await db.collection(collection).findOne({ _id: id });
  }

  async insertOne(collection, document) {
    const db = this.getDb();
    
    // Auto-generate ID falls nicht vorhanden
    if (!document._id) {
      if (collection === 'surveys' || collection === 'survey-responses' || collection === 'news') {
        // Für diese Collections numerische IDs verwenden
        const count = await db.collection(collection).countDocuments();
        document._id = count + 1;
      } else {
        // Für andere Collections String-IDs generieren
        document._id = new Date().getTime().toString();
      }
    }
    
    document.createdAt = new Date();
    const result = await db.collection(collection).insertOne(document);
    return { ...document, _id: result.insertedId };
  }

  async updateById(collection, id, update) {
    const db = this.getDb();
    update.updatedAt = new Date();
    
    const result = await db.collection(collection).updateOne(
      { _id: id },
      { $set: update }
    );
    
    if (result.matchedCount === 0) {
      throw new Error(`Document with id ${id} not found in ${collection}`);
    }
    
    return await this.findById(collection, id);
  }

  async deleteById(collection, id) {
    const db = this.getDb();
    const result = await db.collection(collection).deleteOne({ _id: id });
    
    if (result.deletedCount === 0) {
      throw new Error(`Document with id ${id} not found in ${collection}`);
    }
    
    return { success: true, deletedId: id };
  }
}

// Singleton Instance
const mongoService = new MongoDBService();

export default mongoService;
