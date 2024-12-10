import mongoose from "mongoose";

export async function connectToMongoDB(){
    try {
        await mongoose.connect(process.env.mongoUri);
        console.log("Connected To Mongo Atlas");
    } catch (error) {
        console.error("Connection Error: ", error);
    }
};

