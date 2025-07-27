const mongoose = require('mongoose');

async function run() {
  try {
    const uri = 'mongodb+srv://Admin:Shivam20222@cluster0.cuic2kf.mongodb.net/test?retryWrites=true&w=majority';

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });

    const db = mongoose.connection.db;
    const collection = db.collection('products');

    // List all indexes first (optional but useful for debugging)
    const indexes = await collection.indexes();
    console.log('📋 Existing Indexes:', indexes);

    // Attempt to drop the specific index
    await collection.dropIndex('qikinkDesignIdentifier_1');
    console.log('✅ Dropped index: qikinkDesignIdentifier_1');

    await mongoose.disconnect();
    console.log('🔌 Disconnected.');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('⚠️ Index "qikinkDesignIdentifier_1" not found. Nothing to drop.');
    } else {
      console.error('❌ Error:', err);
    }
  }
}

run();
