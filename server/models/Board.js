import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      required: true,
      unique: true, // One board configuration profile per user email
      lowercase: true,
    },
    boards: {
      type: Array,
      default: [],
    },
    boardTasks: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    projectColumnOrders: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    selectedBoard: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const Board = mongoose.model("Board", BoardSchema);
export default Board;
