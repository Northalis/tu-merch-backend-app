const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    category: String,
    description: String,
    price: {
      type: Number,
      require: true,
    },
    oldPrice: Number,
    image: String,
    rating: {
      type: Number,
      default: 0,
    },
    author: { type: mongoose.Types.ObjectId, ref: "User", require: true },
  },
  { timestamps: true }
);

const Products = mongoose.model("products", productSchema);

module.exports = Products;
