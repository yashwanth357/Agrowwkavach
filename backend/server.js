const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { User, Post } = require("./models");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5003;
const UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5000000;

// Basic Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both development ports
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/uploads", express.static(UPLOAD_PATH));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/agrowkavach", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_PATH),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Error: Images Only!"));
  },
});

// Get User Profile
app.get("/api/profile/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Create or Update User Profile
app.post("/api/profile", async (req, res) => {
  try {
    const { clerkId, email, location, farmSize, mainCrops, farmingType } =
      req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: "ClerkId and email are required" });
    }

    // Process mainCrops to ensure it's an array
    const cropsArray = Array.isArray(mainCrops)
      ? mainCrops
      : typeof mainCrops === "string"
        ? mainCrops.split(",").map((crop) => crop.trim())
        : mainCrops || ["None"];

    // Find or create user profile
    let user = await User.findOne({ clerkId });

    if (user) {
      // Update existing user
      user.email = email;
      if (location) user.location = location;
      if (farmSize) user.farmSize = farmSize;
      if (mainCrops) user.mainCrops = cropsArray;
      if (farmingType) user.farmingType = farmingType;
    } else {
      // Create new user
      user = new User({
        clerkId,
        email,
        location: location || "Not specified",
        farmSize: farmSize || "0",
        mainCrops: cropsArray,
        farmingType: farmingType || "conventional",
      });
    }

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error("Profile creation/update error:", error);
    res.status(500).json({ error: "Failed to create/update profile" });
  }
});

// Update Profile
app.put("/api/profile/:clerkId", async (req, res) => {
  try {
    const { location, farmSize, mainCrops, farmingType } = req.body;

    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (location) user.location = location;
    if (farmSize) user.farmSize = farmSize;
    if (mainCrops) {
      user.mainCrops = Array.isArray(mainCrops)
        ? mainCrops
        : mainCrops.split(",").map((crop) => crop.trim());
    }
    if (farmingType) user.farmingType = farmingType;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Create Post
app.post("/api/posts", upload.single("image"), async (req, res) => {
  try {
    const { content, clerkId } = req.body;

    if (!content || !clerkId) {
      return res
        .status(400)
        .json({ error: "Content and clerkId are required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = new Post({
      author: user._id,
      content,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await post.save();
    await post.populate("author", "email location");

    res.status(201).json(post);
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get Posts
app.get("/api/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "email location")
      .populate("comments.user", "email");

    const total = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Like/Unlike Post
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const { clerkId } = req.body;
    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(user._id);
    if (likeIndex === -1) {
      post.likes.push(user._id);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    await post.populate("author", "email location");
    res.json(post);
  } catch (error) {
    console.error("Like/Unlike error:", error);
    res.status(500).json({ error: "Failed to update like" });
  }
});

// Add Comment
app.post("/api/posts/:id/comment", async (req, res) => {
  try {
    const { clerkId, text } = req.body;
    if (!clerkId || !text) {
      return res.status(400).json({ error: "clerkId and text are required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({
      user: user._id,
      text,
    });

    await post.save();
    await post.populate("comments.user", "email");
    res.json(post);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Environment:", process.env.NODE_ENV || "development");
});
