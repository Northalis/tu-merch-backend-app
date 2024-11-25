const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.this.status(401).send({ message: "Invalid token" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded) {
      return res.this
        .status(401)
        .send({ message: "Invalid token or not valid" });
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error("Error While verifying token", Error);
    res.status(401).send({ message: "Server error" });
  }
};

module.exports = verifyToken;
