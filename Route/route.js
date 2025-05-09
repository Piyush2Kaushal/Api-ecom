const express = require("express");
const User = require("../Model/user");
const router = express.Router();
const { signup } = require("../Controller/authControl");
const { signin } = require("../Controller/authControl");
const middleware = require("../Middleware/auth");
router.post("/signup", signup);
router.post("/signin", signin);
// router.get("/protected", middleware, (req, res) => {
//   res.json({
//     message: "Access granted to protected route",
//     userId: req.user.userId,
//   });
// });
router.get("/protected", middleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Access granted to protected route",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
