import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Server } from "socket.io";
import http from "http";
import path from "path";
import cors from "cors";
import { connectToMongoDB } from "./configMongoDB/config.js";
import { chatModel } from "./Chat/chatScehma.js";

const app = express();

var onlineUsers = [];

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Allow requests from this origin 
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

app.use(express.static(path.join(path.resolve(), "css")));
app.use(express.static(path.join(path.resolve(), "public")));

io.on("connection", (socket) => {
    console.log("Connection is established");

    socket.on("userName", async (name) => {
        socket.userName = name;
        onlineUsers.push(name);
        socket.broadcast.emit("newUser", name);
        io.emit("onlineUsers", onlineUsers);

        // Send chat history to the user 
        try {
            const messages = await chatModel.find({});
            socket.emit("chatHistory", messages,name);
        } catch (err) {
            console.error("Error retrieving chat history:", err);
        }
    })

    socket.on("userMessage", async (messageObject) => {
        try {
            socket.broadcast.emit("serverMessage", messageObject);
    
            const newChat = await chatModel.create({
                userName: messageObject.userName,
                message: messageObject.userMessage,
                timestamp: messageObject.timestamp
            });
            
        } catch (error) {
            console.error("Error: ", error);
        }
    });

    socket.on("typing", () => {
        socket.broadcast.emit("userTyping", socket.userName);
    });

    socket.on("stopTyping", () => {
        socket.broadcast.emit("userStopTyping", socket.userName);
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("userDisconnected", socket.userName);
        const index = onlineUsers.indexOf(socket.userName);
        if (index !== -1) onlineUsers.splice(index, 1);
        io.emit("onlineUsers", onlineUsers);
        socket.userName = null;
    });


})

server.listen(7001, async () => {
    console.log("Sever is running on PORT: 7001");
    await connectToMongoDB();
});
