import { Schema, model, models} from "mongoose";

const UserSchema = new Schema({

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phone: {
      type: String,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "credentials";
      },
      select: false,
    },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      required: true,
      default: "credentials",
    },

    avatar: {
      type: String,
      default: "/user.png",
    },

    rating: {
      type: Number,
      default: 5,
    },

    createdRides: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],

    joinedRides: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],

  },

  { timestamps: true }

);

export default models.User || model("User", UserSchema);