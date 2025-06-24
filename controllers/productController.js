import { getCache, setCache, deleteCache, deleteCacheByPrefix } from "../utils/cache.js";
import logger from "../middleware/logger.js";
import Product from "../models/product.js";


export const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");
    res.status(201).send(product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const cacheKey = "products_all";
    const cached = await getCache(cacheKey);
    if (cached) return res.send(cached);

    const products = await Product.find().select("name price category").lean();
    await setCache(cacheKey, products);
    res.send(products);
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (!name) return res.status(400).send({ error: "Name query is required" });

    const cacheKey = `search:${name}:${page}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return res.send(cached);

    const skip = (page - 1) * limit;
    const products = await Product.find({ name: { $regex: name, $options: "i" } })
      .skip(skip)
      .limit(parseInt(limit))
      .select("name price category")
      .lean();

    const total = await Product.countDocuments({ name: { $regex: name, $options: "i" } });
    const result = { products, total, page: parseInt(page), limit: parseInt(limit) };
    await setCache(cacheKey, result);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const filterProducts = async (req, res) => {
  const { minPrice, maxPrice } = req.query;
  const min = parseFloat(minPrice);
  const max = parseFloat(maxPrice);
  if (isNaN(min) || isNaN(max)) {
    return res.status(400).send({ error: "Invalid price range" });
  }
  const products = await Product.find({
    price: { $gte: min, $lte: max },
  }).select("name price category");
  res.status(200).send({ products });
};

export const getStats = async (req, res) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);
  res.status(200).send(stats);
};

export const importProducts = async (req, res) => {
  const mockProducts = [
    { name: "Imported A", price: 120, category: "imported" },
    { name: "Imported B", price: 180, category: "imported" },
    { name: "Imported C", price: 95, category: "imported" },
  ];
  const inserted = await Product.insertMany(mockProducts);
  res.status(200).send(inserted);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send({ error: "Product not found" });
  res.send(product);
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(400).send({ error: "Product not found" });

    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");

    res.send(product);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");

    logger.info(`Product deleted: ${product.name}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};