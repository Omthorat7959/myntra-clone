const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const BrowsingHistory = require("../models/BrowsingHistory");
const Wishlist = require("../models/Wishlist");

// Track product view
router.post("/track", async (req, res) => {
  const { userId, productId, category } = req.body;
  try {
    if (userId) {
      // Remove duplicate if already viewed
      await BrowsingHistory.deleteOne({ userId, productId });

      // Save new view at top
      await BrowsingHistory.create({ userId, productId, category });

      // Keep only last 20 viewed products per user
      const history = await BrowsingHistory.find({ userId })
        .sort({ viewedAt: -1 });
      if (history.length > 20) {
        const toDelete = history.slice(20).map(h => h._id);
        await BrowsingHistory.deleteMany({ _id: { $in: toDelete } });
      }
    }
    res.json({ message: "Tracked" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Get recommendations
router.get("/:productId", async (req, res) => {
  try {
    const { userId } = req.query;
    const { productId } = req.params;

    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let categoryScores = {};

    // Score from current product category
    if (currentProduct.category) {
      categoryScores[currentProduct.category] =
        (categoryScores[currentProduct.category] || 0) + 3;
    }

    if (userId) {
      // Score from browsing history
      const history = await BrowsingHistory.find({ userId })
        .sort({ viewedAt: -1 })
        .limit(10);

      history.forEach((h, index) => {
        if (h.category) {
          const score = 10 - index;
          categoryScores[h.category] =
            (categoryScores[h.category] || 0) + score;
        }
      });

      // Score from wishlist
      const wishlistItems = await Wishlist.find({ userId })
        .populate("productId");
      wishlistItems.forEach(w => {
        if (w.productId?.category) {
          categoryScores[w.productId.category] =
            (categoryScores[w.productId.category] || 0) + 5;
        }
      });
    }

    // Get top categories by score
    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat)
      .slice(0, 3);

    // Fetch recommended products excluding current
    let recommendations = await Product.find({
      _id: { $ne: productId },
      category: {
        $in: topCategories.length > 0
          ? topCategories
          : [currentProduct.category || "general"],
      },
    }).limit(10);

    // Fill with random products if not enough
    if (recommendations.length < 5) {
      const extras = await Product.find({
        _id: {
          $ne: productId,
          $nin: recommendations.map(r => r._id),
        },
      }).limit(10 - recommendations.length);
      recommendations = [...recommendations, ...extras];
    }

    res.json(recommendations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;