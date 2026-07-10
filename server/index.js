import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { protect } from "./middleware/auth.js";
import User from "./models/User.js";
import Board from "./models/Board.js";
import Notification from "./models/Notification.js";
import Team from "./models/Team.js";
import Invitation from "./models/Invitation.js";
import InvitationLog from "./models/InvitationLog.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

/* ── AUTH ROUTERS ────────────────────────────────────────── */

// User Signup (verifies Firebase token and returns MongoDB profile)
app.post("/api/auth/signup", protect, async (req, res) => {
  try {
    res.status(201).json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      notificationSettings: req.user.notificationSettings,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: error.message });
  }
});

// User Signin (verifies Firebase token and returns MongoDB profile)
app.post("/api/auth/signin", protect, async (req, res) => {
  try {
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      notificationSettings: req.user.notificationSettings,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update User details / settings
app.put("/api/auth/update", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.notificationSettings) {
      user.notificationSettings = {
        ...user.notificationSettings,
        ...req.body.notificationSettings,
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      notificationSettings: updatedUser.notificationSettings,
      token: req.headers.authorization.split(" ")[1],
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({ message: error.message });
  }
});


/* ── BOARD ROUTERS ────────────────────────────────────────── */

// Get board data
app.get("/api/boards", protect, async (req, res) => {
  try {
    const board = await Board.findOne({ userEmail: req.user.email });
    if (!board) {
      return res.json({ boards: [], boardTasks: {}, projectColumnOrders: {}, selectedBoard: null });
    }
    res.json(board);
  } catch (error) {
    console.error("Get boards error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Save board data
app.post("/api/boards", protect, async (req, res) => {
  try {
    const { boards, boardTasks, projectColumnOrders, selectedBoard } = req.body;
    let board = await Board.findOne({ userEmail: req.user.email });

    if (board) {
      board.boards = boards;
      board.boardTasks = boardTasks;
      board.projectColumnOrders = projectColumnOrders;
      board.selectedBoard = selectedBoard;
      await board.save();
    } else {
      board = await Board.create({
        userEmail: req.user.email,
        boards,
        boardTasks,
        projectColumnOrders,
        selectedBoard,
      });
    }

    res.json(board);
  } catch (error) {
    console.error("Save boards error:", error);
    res.status(500).json({ message: error.message });
  }
});


/* ── NOTIFICATIONS ROUTERS ────────────────────────────────── */

// Get notifications
app.get("/api/notifications", protect, async (req, res) => {
  try {
    const data = await Notification.findOne({ userEmail: req.user.email });
    if (!data) {
      return res.json({ notifications: [] });
    }
    res.json(data);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Save notifications
app.post("/api/notifications", protect, async (req, res) => {
  try {
    const { notifications } = req.body;
    let data = await Notification.findOne({ userEmail: req.user.email });

    if (data) {
      data.notifications = notifications;
      await data.save();
    } else {
      data = await Notification.create({
        userEmail: req.user.email,
        notifications,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Save notifications error:", error);
    res.status(500).json({ message: error.message });
  }
});


/* ── TEAM ROUTERS ─────────────────────────────────────────── */

// Get team data
app.get("/api/teams", protect, async (req, res) => {
  try {
    const data = await Team.findOne({ userEmail: req.user.email });
    if (!data) {
      return res.json({ teamData: {} });
    }
    res.json(data);
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Save team data
app.post("/api/teams", protect, async (req, res) => {
  try {
    const { teamData } = req.body;
    let data = await Team.findOne({ userEmail: req.user.email });

    if (data) {
      data.teamData = teamData;
      await data.save();
    } else {
      data = await Team.create({
        userEmail: req.user.email,
        teamData,
      });
    }

    res.json(data);
  } catch (error) {
    console.error("Save teams error:", error);
    res.status(500).json({ message: error.message });
  }
});


/* ── INVITATION ROUTERS ───────────────────────────────────── */

// Helper: mark expired pending invitations for a given invitee+board
async function expireStaleInvitations(inviteeEmail, boardName) {
  const stale = await Invitation.find({
    inviteeEmail,
    boardName,
    status: "pending",
    expiresAt: { $lte: new Date() },
  });
  for (const inv of stale) {
    inv.status = "expired";
    await inv.save();
    await InvitationLog.create({
      invitationId: inv._id,
      event: "expired",
      actor: "system",
      meta: { boardName, inviteeEmail },
    });
  }
}

// Helper: push a notification into a user's Notification document
async function pushNotification(userEmail, notif) {
  let doc = await Notification.findOne({ userEmail });
  if (!doc) {
    doc = await Notification.create({ userEmail, notifications: [] });
  }
  // Prevent duplicate notification for the same invitation
  const alreadyExists = doc.notifications.some((n) => n.id === notif.id);
  if (!alreadyExists) {
    doc.notifications = [notif, ...doc.notifications];
    await doc.save();
  }
}

// POST /api/invitations/send — invite a member to a board
app.post("/api/invitations/send", protect, async (req, res) => {
  try {
    const { inviteeEmail, boardName, role } = req.body;

    if (!inviteeEmail || !boardName || !role) {
      return res.status(400).json({ message: "inviteeEmail, boardName and role are required." });
    }

    const normalizedInvitee = inviteeEmail.trim().toLowerCase();

    // Prevent self-invitation
    if (normalizedInvitee === req.user.email) {
      return res.status(400).json({ message: "You cannot invite yourself." });
    }

    // Expire any stale pending invites before checking duplicates
    await expireStaleInvitations(normalizedInvitee, boardName);

    // Check for existing pending invitation (same inviter + invitee + board)
    const existing = await Invitation.findOne({
      inviterEmail: req.user.email,
      inviteeEmail: normalizedInvitee,
      boardName,
      status: "pending",
    });

    if (existing) {
      await InvitationLog.create({
        invitationId: existing._id,
        event: "duplicate_blocked",
        actor: req.user.email,
        meta: { boardName, role },
      });
      return res.status(409).json({
        message: "A pending invitation already exists for this member and board.",
        invitationId: existing._id,
      });
    }

    // Create invitation
    const invitation = await Invitation.create({
      inviterEmail: req.user.email,
      inviterName: req.user.name,
      inviteeEmail: normalizedInvitee,
      boardName,
      role,
    });

    // Audit log
    await InvitationLog.create({
      invitationId: invitation._id,
      event: "created",
      actor: req.user.email,
      meta: { boardName, role, inviteeEmail: normalizedInvitee },
    });

    // Push notification to invitee's Notification document
    const notifId = `invite_${invitation._id}`;
    await pushNotification(normalizedInvitee, {
      id: notifId,
      title: "Team Invitation 🎉",
      message: `${req.user.name} invited you to join "${boardName}" as ${role}.`,
      type: "info",
      timestamp: Date.now(),
      read: false,
      invitationType: "invite",
      invitationId: invitation._id.toString(),
      inviterName: req.user.name,
      inviterEmail: req.user.email,
      boardName,
      role,
      category: "systemUpdates",
    });

    res.status(201).json({ message: "Invitation sent.", invitation });
  } catch (error) {
    console.error("Send invitation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/invitations/respond — accept or decline an invitation
app.post("/api/invitations/respond", protect, async (req, res) => {
  try {
    const { invitationId, action } = req.body;

    if (!invitationId || !action || !["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "invitationId and action (accept|decline) are required." });
    }

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }

    // Only the invitee may respond
    if (invitation.inviteeEmail !== req.user.email) {
      return res.status(403).json({ message: "You are not the recipient of this invitation." });
    }

    // Check status
    if (invitation.status !== "pending") {
      return res.status(409).json({ message: `Invitation is already ${invitation.status}.` });
    }

    // Check expiry
    if (invitation.expiresAt <= new Date()) {
      invitation.status = "expired";
      await invitation.save();
      await InvitationLog.create({
        invitationId: invitation._id,
        event: "expired",
        actor: req.user.email,
        meta: { boardName: invitation.boardName },
      });
      return res.status(410).json({ message: "This invitation has expired." });
    }

    invitation.status = action === "accept" ? "accepted" : "declined";
    invitation.respondedAt = new Date();
    await invitation.save();

    // Audit log
    await InvitationLog.create({
      invitationId: invitation._id,
      event: action === "accept" ? "accepted" : "declined",
      actor: req.user.email,
      meta: {
        boardName: invitation.boardName,
        role: invitation.role,
        inviterEmail: invitation.inviterEmail,
      },
    });

    if (action === "accept") {
      // Add invitee to the inviter's Team document for this board
      const MEMBER_COLORS = [
        "bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-indigo-500",
        "bg-orange-500", "bg-rose-500", "bg-amber-500", "bg-teal-500",
      ];
      const initials = req.user.name
        ? req.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";
      const color = MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
      const newMember = {
        id: String(Date.now()),
        name: req.user.name,
        email: req.user.email,
        role: invitation.role,
        avatar: initials,
        color,
        status: "online",
        tasks: 0,
      };

      let teamDoc = await Team.findOne({ userEmail: invitation.inviterEmail });
      if (!teamDoc) {
        teamDoc = await Team.create({
          userEmail: invitation.inviterEmail,
          teamData: { [invitation.boardName]: [newMember] },
        });
      } else {
        const boardMembers = teamDoc.teamData[invitation.boardName] || [];
        // Prevent duplicate member if somehow accepted twice
        const alreadyMember = boardMembers.some(
          (m) => m.email === req.user.email
        );
        if (!alreadyMember) {
          teamDoc.teamData = {
            ...teamDoc.teamData,
            [invitation.boardName]: [...boardMembers, newMember],
          };
          teamDoc.markModified("teamData");
          await teamDoc.save();
        }
      }

      // Notify inviter of acceptance
      await pushNotification(invitation.inviterEmail, {
        id: `invite_accepted_${invitation._id}`,
        title: "Invitation Accepted ✅",
        message: `${req.user.name} accepted your invitation to join "${invitation.boardName}".`,
        type: "success",
        timestamp: Date.now(),
        read: false,
        category: "systemUpdates",
      });
    } else {
      // Notify inviter of decline
      await pushNotification(invitation.inviterEmail, {
        id: `invite_declined_${invitation._id}`,
        title: "Invitation Declined",
        message: `${req.user.name} declined your invitation to join "${invitation.boardName}".`,
        type: "warning",
        timestamp: Date.now(),
        read: false,
        category: "systemUpdates",
      });
    }

    res.json({ message: `Invitation ${invitation.status}.`, invitation });
  } catch (error) {
    console.error("Respond to invitation error:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/invitations — get all invitations for the current user
app.get("/api/invitations", protect, async (req, res) => {
  try {
    // Expire stale ones on read (all boards)
    const stale = await Invitation.find({
      inviteeEmail: req.user.email,
      status: "pending",
      expiresAt: { $lte: new Date() },
    });
    for (const inv of stale) {
      inv.status = "expired";
      await inv.save();
      await InvitationLog.create({
        invitationId: inv._id,
        event: "expired",
        actor: "system",
        meta: { boardName: inv.boardName },
      });
    }

    const invitations = await Invitation.find({
      $or: [
        { inviterEmail: req.user.email },
        { inviteeEmail: req.user.email },
      ],
    }).sort({ createdAt: -1 });

    res.json({ invitations });
  } catch (error) {
    console.error("Get invitations error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/invitations/:id — cancel a pending invitation (inviter only)
app.delete("/api/invitations/:id", protect, async (req, res) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found." });
    }
    if (invitation.inviterEmail !== req.user.email) {
      return res.status(403).json({ message: "Only the inviter may cancel this invitation." });
    }
    if (invitation.status !== "pending") {
      return res.status(409).json({ message: `Cannot cancel an invitation that is already ${invitation.status}.` });
    }
    invitation.status = "declined";
    invitation.respondedAt = new Date();
    await invitation.save();
    await InvitationLog.create({
      invitationId: invitation._id,
      event: "cancelled",
      actor: req.user.email,
      meta: { boardName: invitation.boardName, inviteeEmail: invitation.inviteeEmail },
    });
    res.json({ message: "Invitation cancelled.", invitation });
  } catch (error) {
    console.error("Cancel invitation error:", error);
    res.status(500).json({ message: error.message });
  }
});


// Ping route
app.get("/api/ping", (req, res) => {
  res.json({ status: "alive" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
