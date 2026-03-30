const express = require("express");
const Bag = require("../models/Bag");
const router = express.Router();

// Add item to bag
router.post("/", async (req, res) => {
  try {
    const Bags = new Bag(req.body);
    const saveitem = await Bags.save();
    res.status(200).json(saveitem);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ SPECIFIC ROUTES FIRST
// Get saved for later items
router.get("/saved/:userid", async (req, res) => {
  try {
    const saved = await Bag.find({
      userId: req.params.userid,
      savedForLater: true,
    }).populate("productId");
    res.status(200).json(saved);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Move item to saved for later
router.put("/save/:itemid", async (req, res) => {
  try {
    const updated = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { savedForLater: true },
      { new: true }
    );
    console.log("Saved for later:", updated);
    res.status(200).json({ message: "Item saved for later" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Move item back to cart
router.put("/movetocart/:itemid", async (req, res) => {
  try {
    const updated = await Bag.findByIdAndUpdate(
      req.params.itemid,
      { savedForLater: false },
      { new: true }
    );
    console.log("Moved to cart:", updated);
    res.status(200).json({ message: "Item moved to cart" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ GENERIC ROUTES AFTER
// Get active bag items only
router.get("/:userid", async (req, res) => {
  try {
    const bag = await Bag.find({
      userId: req.params.userid,
      savedForLater: false,
    }).populate("productId");
    res.status(200).json(bag);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Update quantity
router.put("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndUpdate(req.params.itemid, {
      quantity: req.body.quantity,
    });
    res.status(200).json({ message: "Quantity updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

// Delete item
router.delete("/:itemid", async (req, res) => {
  try {
    await Bag.findByIdAndDelete(req.params.itemid);
    res.status(200).json({ message: "Item removed from bag" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error removing item from bag" });
  }
});

module.exports = router;