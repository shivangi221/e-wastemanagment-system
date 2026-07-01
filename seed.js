// seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const Bin = require('./models/Bin');

const sampleBins = [
  {
    name: "Tech Park Smart Recycling Hub",
    address: "Main Gate Alpha, Sector 62",
    location: { type: "Point", coordinates: [77.3724, 28.6272] } // [Longitude, Latitude]
  },
  {
    name: "Eco-Waste Drop Station",
    address: "Near Metro Station Parking Lot, Gate 2",
    location: { type: "Point", coordinates: [77.3582, 28.6145] }
  },
  {
    name: "Green Earth Community Bin",
    address: "Central Market Shopping Complex Lane",
    location: { type: "Point", coordinates: [77.3891, 28.6398] }
  }
];

async function seedData() {
  try {
    console.log("🔄 Opening connection to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log("🧹 Cleaning out old, messy data points...");
    await Bin.deleteMany({}); 
    
    console.log("📥 Depositing 3 fresh smart bin locations...");
    await Bin.insertMany(sampleBins);
    
    console.log("🎉 Successfully populated the cloud database!");
    mongoose.connection.close();
    console.log("🔌 Cleaned connection state.");
  } catch (error) {
    console.error("❌ Database insertion error:", error);
  }
}

seedData();