const express = require("express");
const router = express.Router();

const productController = require("../Controller/productController");
const verifyAdmin = require("../Middleware/adminAuth");
const verifyUser = require("../Middleware/auth");

//Admin-only
router.post("/create", verifyAdmin, productController.createProduct);
router.put("/update/:id", verifyAdmin, productController.updateProduct);
router.delete("/delete/:id", verifyAdmin, productController.deleteProduct);

//user
router.get("/all", productController.getAllProducts);
router.get("/:id", productController.getProductById);

module.exports = router;
