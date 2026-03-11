import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/Usermodel.js";
import Property from "../models/propertymodel.js";

dotenv.config({ path: 'backend/.env' });

const checkDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not defined');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();

    console.log(`Users: ${userCount}`);
    console.log(`Properties: ${propertyCount}`);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkDB();
