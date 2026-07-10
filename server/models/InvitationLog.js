import mongoose from "mongoose";

const InvitationLogSchema = new mongoose.Schema(
  {
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invitation",
      required: true,
    },
    event: {
      type: String,
      required: true,
      enum: [
        "created",
        "accepted",
        "declined",
        "expired",
        "duplicate_blocked",
        "cancelled",
      ],
    },
    actor: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast audit queries by invitation or actor
InvitationLogSchema.index({ invitationId: 1, createdAt: -1 });
InvitationLogSchema.index({ actor: 1, createdAt: -1 });

const InvitationLog = mongoose.model("InvitationLog", InvitationLogSchema);
export default InvitationLog;
