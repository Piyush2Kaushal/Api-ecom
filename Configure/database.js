const mongoose = require("mongoose");
const db = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDb Connected");
  } catch (err) {
    console.log(err);
    console.log(err.message);
    process.exit(1);
  }
};

module.exports = db;
