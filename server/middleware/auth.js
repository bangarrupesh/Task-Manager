import { verifyFirebaseToken } from "../firebase.js";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token with Firebase
      const decodedToken = await verifyFirebaseToken(token);

      // Find user in MongoDB using email from token
      let user = await User.findOne({ email: decodedToken.email });

      // If user doesn't exist in MongoDB, auto-provision them!
      if (!user) {
        user = await User.create({
          name: decodedToken.name || decodedToken.email.split("@")[0],
          email: decodedToken.email,
          // Since it's a Firebase user, password is not checked locally.
          // We set a random encrypted string just in case database schema requires it.
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
        });
        console.log(`Auto-provisioned new MongoDB user for email: ${decodedToken.email}`);
      }

      // Attach user info to request (with standard fields expected by other routes)
      req.user = {
        id: user._id,
        email: user.email,
        name: user.name,
        notificationSettings: user.notificationSettings,
        uid: decodedToken.uid
      };

      return next();
    } catch (error) {
      console.error("Firebase auth verification error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
