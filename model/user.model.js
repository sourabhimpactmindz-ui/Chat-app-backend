import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    chatId: {
      type: String,
      required: true,
      unique: true,
    },

    profile: {
      bio: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        default: "",
      },

      location: {
        type: String,
        default: "",
      },

      website: {
        type: String,
        default: "",
      },
    },

    images: {
      avatar: {
        url: {
          type: String,
          default: "",
        },

        public_id: {
          type: String,
          default: "",
        },
      },

      cover: {
        url: {
          type: String,
          default: "",
        },

        public_id: {
          type: String,
          default: "",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);