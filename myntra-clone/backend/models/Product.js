const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: String,
    brand: String,
    price: Number,
    discount: String,
    description: String,
    sizes: [String],
    images: [String],
    category: { type: String, default: "general" }, // ✅ ADDED
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);