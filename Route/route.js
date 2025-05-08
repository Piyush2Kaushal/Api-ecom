const express = require("express");
const router = express.Router();
const { signup } = require("../Controller/authControl");
const { signin } = require("../Controller/authControl");
const middleware = require("../Middleware/auth");
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/protected", middleware, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    userId: req.user.userId,
  });
});
module.exports = router;
