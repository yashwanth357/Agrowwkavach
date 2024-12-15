const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { User, Post } = require("./models");
const OpenAI = require("openai");
require("dotenv").config();

// Server Configuration
const app = express();
const PORT = process.env.PORT || 5003;
const UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5000000; // 5MB

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Basic Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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

// Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `You are a helpful farming and agriculture assistant. Your role is to:
    - Answer questions about farming techniques, crop management, and agricultural practices
    - Provide guidance on sustainable farming methods
    - Help diagnose common crop issues and suggest solutions
    - Share knowledge about soil health, irrigation, and pest management
    - Recommend best practices for various types of farming

    Keep your responses focused on farming and agriculture. If asked about unrelated topics,
    politely redirect the conversation back to farming.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    res.json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// Profile Routes
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

app.post("/api/profile", async (req, res) => {
  try {
    const { clerkId, email, location, farmSize, mainCrops, farmingType } =
      req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ error: "ClerkId and email are required" });
    }

    const cropsArray = Array.isArray(mainCrops)
      ? mainCrops
      : mainCrops?.split(",").map((crop) => crop.trim()) || ["None"];

    let user = await User.findOne({ clerkId });

    if (user) {
      user.email = email;
      if (location) user.location = location;
      if (farmSize) user.farmSize = farmSize;
      if (mainCrops) user.mainCrops = cropsArray;
      if (farmingType) user.farmingType = farmingType;
    } else {
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

// Posts Routes
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
    await post.populate([
      {
        path: "author",
        select: "email location clerkId",
      },
      {
        path: "comments.user",
        select: "email clerkId",
      },
    ]);

    res.status(201).json(post);
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.userId) {
      const user = await User.findOne({ clerkId: req.query.userId });
      if (user) {
        query.author = user._id;
      }
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "email location clerkId",
      })
      .populate({
        path: "comments.user",
        select: "email clerkId",
      });

    const total = await Post.countDocuments(query);

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
    await post.populate([
      {
        path: "author",
        select: "email location clerkId",
      },
      {
        path: "comments.user",
        select: "email clerkId",
      },
    ]);

    res.json(post);
  } catch (error) {
    console.error("Like/Unlike error:", error);
    res.status(500).json({ error: "Failed to update like" });
  }
});

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
    await post.populate([
      {
        path: "author",
        select: "email location clerkId",
      },
      {
        path: "comments.user",
        select: "email clerkId",
      },
    ]);

    res.json(post);
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { clerkId } = req.body;

    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(req.params.id).populate(
      "author",
      "clerkId",
    );
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.clerkId !== clerkId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }

    if (post.image) {
      const imagePath = path.join(__dirname, post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

app.delete("/api/posts/:postId/comments/:commentId", async (req, res) => {
  try {
    const { clerkId } = req.body;
    const { postId, commentId } = req.params;

    if (!clerkId) {
      return res.status(400).json({ error: "clerkId is required" });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (comment.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    post.comments.pull(commentId);
    await post.save();

    await post.populate([
      {
        path: "author",
        select: "email location clerkId",
      },
      {
        path: "comments.user",
        select: "email clerkId",
      },
    ]);

    res.json(post);
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File is too large",
        details: `Maximum file size is ${MAX_FILE_SIZE / 1000000}MB`,
      });
    }
  }
  res.status(500).json({
    error: "Something went wrong!",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Environment:", process.env.NODE_ENV || "development");

  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(UPLOAD_PATH)) {
    fs.mkdirSync(UPLOAD_PATH, { recursive: true });
    console.log("Created uploads directory");
  }
});
