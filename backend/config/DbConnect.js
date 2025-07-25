import mongoose from "mongoose";

const DbConnect = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Mongoose connected .......
     `);
};

export default DbConnect