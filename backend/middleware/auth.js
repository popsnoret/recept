// Middleware that verifies JWT tokens and protects routes
// so only authenticated users can access them.

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Du måste vara inloggad.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Ogiltig eller utgången token.",
    });
  }
}

module.exports = authenticateToken;
