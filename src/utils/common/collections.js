const mongoose = require('mongoose');

/**
 * Lists all collection names in the connected MongoDB database.
 *
 * @returns {Promise<string[]>} An array of collection names.
 */
async function listCollections() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map(c => c.name);
}

/**
 * Retrieves the schema definition for a specific collection.
 *
 * @param {string} collectionName The name of the collection.
 * @returns {Promise<Object | null>} The schema definition object or null if not found.
 */
async function getCollectionSchema(collectionName) {
    try {
      const collection = mongoose.connection.db.collection(collectionName);
      const data = await collection.find({}).toArray();
      return data;
    } catch (error) {
      console.error('Error fetching schema:', error);
      throw error;
    }
}

module.exports = {
  listCollections,
  getCollectionSchema,
};
