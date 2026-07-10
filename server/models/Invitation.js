import mongoose from "mongoose";
import crypto from "crypto";

const InvitationSchema = new mongoose.Schema(
  {
    inviterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    inviterName: {
      type: String,
      required: true,
      trim: true,
    },
    inviteeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    boardName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Developer", "Designer", "DevOps", "QA"],
      default: "Developer",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    token: {
      type: String,
      default: () => crypto.randomUUID(),
      unique: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to efficiently query pending invitations and detect duplicates
InvitationSchema.index(
  { inviterEmail: 1, inviteeEmail: 1, boardName: 1, status: 1 }
);

// TTL index: MongoDB auto-removes documents 30 days after expiry for cleanup
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Invitation = mongoose.model("Invitation", InvitationSchema);
export default Invitation;
