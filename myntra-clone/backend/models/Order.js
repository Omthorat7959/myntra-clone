const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [          // ✅ changed from 'item' to 'items'
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        size: String,
        price: Number,
        quantity: Number,
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Processing",
    },
    shippingAddress: {
      type: String,
    },
    paymentMethod: {
      type: String,
      default: "Card",
    },
    tracking: {
      number: String,
      carrier: String,
      estimatedDelivery: String,
      currentLocation: String,
      status: String,
      timeline: [
        {
          status: String,
          location: String,
          timestamp: String,
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);