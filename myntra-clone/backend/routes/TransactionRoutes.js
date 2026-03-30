const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Get all transactions for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, startDate, endDate, sort } = req.query;

    let query = { userId };

    // Filter by payment type
    if (type && type !== "all") {
      query.paymentMethod = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(query)
      .populate("items.productId")
      .sort({ createdAt: sort === "oldest" ? 1 : -1 });

    // Format as transactions
    const transactions = orders.map(order => ({
      _id: order._id,
      orderId: order._id.toString().slice(-8).toUpperCase(),
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod || "Card",
      status: order.status || "Completed",
      date: order.createdAt,
      items: order.items?.length || 0,
      shippingAddress: order.shippingAddress,
    }));

    res.json(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Export transactions as CSV
router.get("/export/csv/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    const headers = ["Order ID", "Amount", "Payment Method", "Status", "Date", "Items"];
    const rows = orders.map(order => [
      order._id.toString().slice(-8).toUpperCase(),
      order.totalAmount || 0,
      order.paymentMethod || "Card",
      order.status || "Completed",
      new Date(order.createdAt).toLocaleDateString("en-IN"),
      order.items?.length || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.send(csv);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;