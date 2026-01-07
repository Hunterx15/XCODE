const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
      trim: true,
    },

    lastName: {
      type: String,
      minLength: 3,
      maxLength: 20,
      trim: true,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,          // ✅ ONLY field that should be unique
      trim: true,
      lowercase: true,
      immutable: true,
    },

    age: {
      type: Number,
      min: 6,
      max: 80,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    /* ✅ FIXED FIELD */
    problemSolved: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "problem",
        },
      ],
      default: [],           // ✅ VERY IMPORTANT
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= CASCADE DELETE ================= */
userSchema.post("findOneAndDelete", async function (userInfo) {
  if (userInfo) {
    await mongoose
      .model("submission")
      .deleteMany({ userId: userInfo._id });
  }
});

const User = mongoose.model("user", userSchema);

module.exports = User;
