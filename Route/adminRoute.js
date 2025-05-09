const express = require("express");
const router = express.Router();
const { adminSignup, adminSignin } = require("../Controller/adminControl");

router.post("/signup", adminSignup);
router.post("/signin", adminSignin);

const verifyAdmin = require("../Middleware/adminAuth");
const Admin = require("../Model/admin");

router.get("/protected", verifyAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Access granted to admin protected route",
      admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
