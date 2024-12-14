const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
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
    createdAt: {
      type: Date,
      default: Date.now,
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
    shares: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // New fields for retweet functionality
    isRetweet: {
      type: Boolean,
      default: false,
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },
    retweetedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    retweetCount: {
      type: Number,
      default: 0,
    },
    retweetContent: {
      type: String,
      trim: true,
      default: null, // For quote retweets
    },
  },
  {
    timestamps: true,
  },
);

// Add index for better query performance
postSchema.index({ isRetweet: 1, originalPost: 1 });

// Middleware to update retweet count on the original post
postSchema.pre("save", async function (next) {
  if (this.isRetweet && this.originalPost && this.isModified("isRetweet")) {
    try {
      await mongoose
        .model("Post")
        .findByIdAndUpdate(this.originalPost, { $inc: { retweetCount: 1 } });
    } catch (error) {
      next(error);
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

module.exports = { User, Post };
