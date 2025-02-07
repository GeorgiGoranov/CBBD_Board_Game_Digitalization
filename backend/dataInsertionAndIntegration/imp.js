require('dotenv').config({path: '../.env'});
console.log('MongoDB URL:', process.env.MONG_URL_CBBD); 
const { MongoClient } = require('mongodb');
const fs = require('fs');

// Connection URL
const url = process.env.MONG_URL_CBBD;
const dbName = 'CBBD';
// const collectionName = 'other-cards';
const collectionName = 'profiles-data';


// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('imp-data-profiles-def.json', 'utf8'));

async function importData() {
  const client = new MongoClient(url);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected successfully to server');

    // Select the database and collection
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert the JSON data into the collection
    const result = await collection.insertMany(jsonData);
    console.log(`${result.insertedCount} documents were inserted`);

  } catch (err) {
    console.error('Error importing data:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the import
importData();
