import express from "express";
const router = express.Router();
import {
  createProduct,
  getAllProducts,
  searchProducts,
  filterProducts,
  getStats,
  importProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { authenticate, authorize, validateProduct, validateUpdateProduct, validateId } from "../middleware/index.js";
router.get("/products", getAllProducts);
router.get("/products/search", searchProducts);
router.get("/products/filter", filterProducts);
router.get("/products/stats", getStats);
router.get("/products/import", importProducts);
router.get("/products/:id", validateId, getProductById);
router.post("/products", authenticate, validateProduct, createProduct);
router.put("/products/:id", validateUpdateProduct, validateId, updateProduct);
router.delete("/products/:id", authenticate, authorize("admin"), validateId, deleteProduct);


export default router;