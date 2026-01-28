import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
<<<<<<< HEAD
    // console.log(`MongoDB Connected: ${conn.connection.host}`);
=======
    console.log(`MongoDB Connected: ${conn.connection.host}`);
>>>>>>> 8ab38add65cb6c2995cfc83dfbfa5d793287fa4f
    console.log(`Connected to MongoDB Database`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
