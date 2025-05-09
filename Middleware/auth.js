// const jwt = require("jsonwebtoken");
// const auth = (req, res, next) => {
//   const token = req.header("Authorization");
//   if (!token) {
//     return res.status(401).json({
//       message: "access cancel ",
//     });
//   }
//   try {
//     const decode = jwt.verify(
//       token.replace("Bearer", ""),
//       process.env.JWT_SECRET
//     );
//     req.user = decode;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: "invalid token" });
//   }
// };
// module.exports = auth;
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied, token missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
