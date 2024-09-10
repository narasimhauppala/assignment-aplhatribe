const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIo = require("socket.io");

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow any origin; adjust as needed for security
    methods: ["GET", "POST"],
  },
});

// Set up Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Listen for post subscription events from clients
  socket.on("subscribeToPost", (postId) => {
    console.log(`Client subscribed to updates on post: ${postId}`);
    socket.join(postId); // Join the socket to a room with postId
  });

  // Listen for client disconn
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Middleware to attach Socket.io instance to req
app.use((req, res, next) => {
  req.io = io; // Attach the Socket.io instance to req
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    home: "Home of API /",
  });
});

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

// If There is no Auth Token
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(err.status).send({
      message: err.message,
    });
    return;
  }
  next();
});

app.all("*", (req, res) => {
  return res.status(404).json({
    error: `404 cannot find the URL ${req.originalUrl}`,
  });
});

mongoose
  .connect(process.env.MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB CONNECTED...!");
    server.listen(process.env.PORT, () => {
      console.log(`Server Running at PORT: ${process.env.PORT}`);
    });
  });
