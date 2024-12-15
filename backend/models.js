const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
    },
    farmSize: {
      type: String,
      required: true,
    },
    mainCrops: [
      {
        type: String,
        required: true,
      },
    ],
    farmingType: {
      type: String,
      required: true,
      enum: ["organic", "mixed", "conventional", "sustainable"],
    },
  },
  {
    timestamps: true,
  },
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Timeline Entry Schema
const timelineEntrySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    activity: {
      type: String,
      required: true,
      enum: [
        "soil-preparation",
        "sowing",
        "fertilization",
        "irrigation",
        "pest-control",
        "harvesting",
        "pruning",
        "weeding",
        "monitoring",
        "other",
      ],
    },
    weather: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String, // URLs to stored images
      },
    ],
    metrics: {
      temperature: Number,
      humidity: Number,
      rainfall: Number,
      soilPH: Number,
      // Add other metrics as needed
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Timeline Schema
const timelineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    cropType: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
    entries: [timelineEntrySchema],
    totalArea: {
      value: Number,
      unit: {
        type: String,
        enum: ["acres", "hectares", "square-meters"],
        default: "acres",
      },
    },
    expectedYield: {
      value: Number,
      unit: String,
    },
    actualYield: {
      value: Number,
      unit: String,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Create indexes for better query performance
timelineSchema.index({ user: 1, status: 1 });
timelineSchema.index({ cropType: 1 });
timelineSchema.index({ startDate: 1 });

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);
const Timeline = mongoose.model("Timeline", timelineSchema);

module.exports = { User, Post, Timeline };
