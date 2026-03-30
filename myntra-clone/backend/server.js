const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const userrouter = require("./routes/Userroutes");
const categoryrouter = require("./routes/Categoryroutes");
const productrouter = require("./routes/Productroutes");
const Bagroutes = require("./routes/Bagroutes");
const Wishlistroutes = require("./routes/Wishlistroutes");
const OrderRoutes = require("./routes/OrderRoutes");
const NotificationRoutes = require("./routes/NotificationRoutes");
const TransactionRoutes = require("./routes/TransactionRoutes");
const RecommendationRoutes = require("./routes/RecommendationRoutes");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // ✅ Allow ALL origins — fixes CORS permanently

// Routes
app.get("/", (req, res) => {
  res.send("✅ Myntra backend is working");
});
app.use("/user", userrouter);
app.use("/category", categoryrouter);
app.use("/product", productrouter);
app.use("/bag", Bagroutes);
app.use("/wishlist", Wishlistroutes);
app.use("/Order", OrderRoutes);
app.use("/notifications", NotificationRoutes);
app.use("/transactions", TransactionRoutes);
app.use("/recommendations", RecommendationRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongodb connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));