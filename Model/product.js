const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String },
    brand: { type: String },
    quantity: { type: Number, default: 0 },
    manufactureBy: { type: String },
    color: { type: String },
    size: { type: String },
    features: { type: String },
    rating: { type: Number, default: 0 },
    discount: { type: Number },
    available: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
