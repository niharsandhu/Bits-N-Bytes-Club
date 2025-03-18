const jwt = require('jsonwebtoken');
const JWT_SECRET = "your_jwt_secret";


exports.authMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const token = req.header('Authorization');

            if (!token) {
                return res.status(401).json({ message: "Access denied. No token provided." });
            }

            // Remove "Bearer " prefix if present
            const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

            // Verify JWT Token
            const decoded = jwt.verify(tokenValue,JWT_SECRET);
            console.log("Decoded User:", decoded); // Debugging Log

            req.user = decoded; // Attach user data to request

            // Check if user role is allowed
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: "Access denied. Unauthorized role." });
            }

            next(); // Proceed if everything is fine
        } catch (error) {
            console.error("JWT Error:", error.message); // Log JWT error
            res.status(401).json({ message: "Invalid token" });
        }
    };
};
