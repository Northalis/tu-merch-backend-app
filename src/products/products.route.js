const express = require("express");
const Reviews = require("../reviews/reviews.model");
const Products = require("./products.model");
const verifyToken = require("../middleware/verifyToken");
const verrifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// post product route
router.post("/create-product", async (req, res) => {
  try {
    const newProduct = new Products({
      ...req.body,
    });
    const savedProduct = await newProduct.save();
    //   calculate review
    const reviews = await Reviews.find({ productId: savedProduct.id });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      savedProduct.rating = averageRating;
      await savedProduct.save();
    }
    res.status(201).send(savedProduct);
  } catch (error) {
    console.error("Error creating new Product ", error);
    res.status(500).send({ message: "Error creating new Product" });
  }
});

// get all product
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Products.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    const products = await Products.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "email")
      .sort({ createdAt: -1 });

    res.status(200).send({ products, totalPages, totalProducts });
  } catch (error) {
    console.error("Error fetching Product ", error);
    res.status(500).send({ message: "Error fetching Product" });
  }
});

//get single product
router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Products.findById(productId).populate(
      "author",
      "email username"
    );
    if (!product) {
      res.status(404).send({ message: "Product not found" });
    }
    const reviews = await Reviews.find({ productId }).populate(
      "userId",
      "username email"
    );
    res.status(200).send({ product, reviews });
  } catch (error) {
    console.error("Error fetching Product ", error);
    res.status(500).send({ message: "Error fetching Product" });
  }
});

// update Product
router.patch(
  "/update-product/:id",
  verifyToken,
  verrifyAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const updatedProduct = await Products.findByIdAndUpdate(
        productId,
        {
          ...req.body,
        },
        { new: true }
      );
      if (!updatedProduct) {
        res.status(404).send({ message: "Product not found" });
      }

      res.status(200).send({
        message: "Product Updated Successful",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Error updating Product ", error);
      res.status(500).send({ message: "Error updating Product" });
    }
  }
);

//delete product
router.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Products.findByIdAndDelete(productId);
    if (!deletedProduct) {
      res.status(404).send({ message: "Product not found" });
    }
    //   delete review relate to product
    await Reviews.deleteMany({ productId: productId });

    res.status(200).send({ messsage: "Product Deleted Succesfully" });
  } catch (error) {
    console.error("Error Deleting Product ", error);
    res.status(500).send({ message: "Error Deleting Product" });
  }
});

//get related product
router.get("/related/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(404).send({ message: "Product ID not found" });
    }
    const product = await Products.findById(id);
    if (!product) {
      res.status(404).send({ message: "Product not found" });
    }

    const titleRegex = new RegExp(
      product.name
        .split(" ")
        .filter((word) => word.length > 1)
        .join("|"),
      "i"
    );

    const relatedProduct = await Products.find({
      id: { $ne: id }, //exclude current product
      $or: [
        {
          name: { $regex: titleRegex }, //match similar name
        },
        { category: product.category }, //Match the same category
      ],
    });

    res.status(200).send(relatedProduct);
  } catch (error) {
    console.error("Error Fetching the related Product ", error);
    res.status(500).send({ message: "Error Fetching the related Product" });
  }
});
module.exports = router;
