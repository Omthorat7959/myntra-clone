const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();

const products = [
  // EXISTING PRODUCTS
  {
    name: "Casual White T-Shirt",
    brand: "Roadster",
    price: 499,
    discount: "60% OFF",
    description: "Classic white t-shirt made from premium cotton. Perfect for everyday wear with a comfortable regular fit.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Denim Jacket",
    brand: "Levis",
    price: 2499,
    discount: "40% OFF",
    description: "Classic denim jacket with a modern twist. Features premium quality denim and comfortable fit.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Summer Dress",
    brand: "ONLY",
    price: 1299,
    discount: "50% OFF",
    description: "Flowy summer dress perfect for warm weather. Made from lightweight fabric with a flattering cut.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1623609163859-ca93c959b98a?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Classic Sneakers",
    brand: "Nike",
    price: 3499,
    discount: "30% OFF",
    description: "Versatile sneakers that combine style and comfort. Perfect for both casual wear and light exercise.",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=500&auto=format&fit=crop",
    ],
  },

  // NEW PRODUCTS — MEN
  {
    name: "Slim Fit Chinos",
    brand: "H&M",
    price: 1299,
    discount: "45% OFF",
    description: "Smart slim fit chinos perfect for casual and semi-formal occasions.",
    sizes: ["28", "30", "32", "34", "36"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Striped Polo T-Shirt",
    brand: "U.S. Polo",
    price: 899,
    discount: "35% OFF",
    description: "Classic striped polo t-shirt made from breathable cotton pique fabric.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Formal Blazer",
    brand: "Raymond",
    price: 4999,
    discount: "25% OFF",
    description: "Sharp formal blazer perfect for office wear and special occasions.",
    sizes: ["38", "40", "42", "44"],
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Running Shorts",
    brand: "Puma",
    price: 699,
    discount: "50% OFF",
    description: "Lightweight running shorts with moisture-wicking fabric for maximum comfort.",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Graphic Print Hoodie",
    brand: "Bewakoof",
    price: 1199,
    discount: "55% OFF",
    description: "Trendy graphic print hoodie made from soft fleece material.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=500&auto=format&fit=crop",
    ],
  },

  // NEW PRODUCTS — WOMEN
  {
    name: "Floral Maxi Dress",
    brand: "Zara",
    price: 2199,
    discount: "40% OFF",
    description: "Beautiful floral maxi dress perfect for summer outings and casual events.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "High Waist Jeans",
    brand: "Levi's",
    price: 2799,
    discount: "30% OFF",
    description: "Trendy high waist jeans with a flattering fit and premium denim quality.",
    sizes: ["26", "28", "30", "32"],
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Crop Top",
    brand: "Forever 21",
    price: 599,
    discount: "60% OFF",
    description: "Stylish crop top perfect for casual wear and summer outfits.",
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1485462537746-965f33f4f31e?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Ethnic Kurti",
    brand: "Biba",
    price: 1499,
    discount: "45% OFF",
    description: "Beautiful ethnic kurti with intricate embroidery. Perfect for festive occasions.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Yoga Pants",
    brand: "Adidas",
    price: 1899,
    discount: "35% OFF",
    description: "High performance yoga pants with 4-way stretch and moisture control.",
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=500&auto=format&fit=crop",
    ],
  },

  // NEW PRODUCTS — FOOTWEAR
  {
    name: "White Sneakers",
    brand: "Adidas",
    price: 4299,
    discount: "20% OFF",
    description: "Clean white sneakers with premium leather upper and cushioned sole.",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10"],
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Heeled Sandals",
    brand: "Steve Madden",
    price: 2999,
    discount: "40% OFF",
    description: "Elegant heeled sandals perfect for parties and formal occasions.",
    sizes: ["UK3", "UK4", "UK5", "UK6", "UK7"],
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Sports Running Shoes",
    brand: "Nike",
    price: 5999,
    discount: "25% OFF",
    description: "High performance running shoes with advanced cushioning technology.",
    sizes: ["UK6", "UK7", "UK8", "UK9", "UK10", "UK11"],
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    ],
  },

  // NEW PRODUCTS — ACCESSORIES
  {
    name: "Leather Watch",
    brand: "Fossil",
    price: 8999,
    discount: "30% OFF",
    description: "Classic leather strap watch with stainless steel case and sapphire glass.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Aviator Sunglasses",
    brand: "Ray-Ban",
    price: 6499,
    discount: "15% OFF",
    description: "Classic aviator sunglasses with UV400 protection and metal frame.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop",
    ],
  },
  {
    name: "Leather Handbag",
    brand: "Lavie",
    price: 3499,
    discount: "50% OFF",
    description: "Spacious leather handbag with multiple compartments and premium finish.",
    sizes: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop",
    ],
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Old products cleared ✅");

    // Insert new products
    await Product.insertMany(products);
    console.log(`${products.length} products added successfully ✅`);

    mongoose.connection.close();
    console.log("Done! 🎉");
  } catch (error) {
    console.log("Error:", error);
    mongoose.connection.close();
  }
};

seedDB();