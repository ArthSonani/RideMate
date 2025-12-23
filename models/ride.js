import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);


const rideSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    source: {
      type: locationSchema,
      required: true,
    },

    destination: {
      type: locationSchema,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    vehicleType: {
      type: String,
      enum: ["auto", "bike", "economy", "sedan", "xl", "premier"],
      default: "auto",
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    availableSeats: {
      type: Number,
      required: true,
    },

    pricePerSeat: {
      type: Number,
      required: true,
    },

    passengers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Incoming join requests awaiting driver action
    requests: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },

    // For geo queries (nearby rides)
    sourceLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    destinationLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },
  },

  { timestamps: true }
);

// Geo indexes for fast nearby search
rideSchema.index({ sourceLocation: "2dsphere" });
rideSchema.index({ destinationLocation: "2dsphere" });

export default mongoose.models.Ride || mongoose.model("Ride", rideSchema);
