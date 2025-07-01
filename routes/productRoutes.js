import express from "express";
const router = express.Router();
import Product from '../models/product.js';
import multer from 'multer';
import path from 'path';
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
  handleAddProduct,
  showAddForm,
  homePage,
  showEditForm,
  handleUpdateProduct,
  handleDeleteProduct,
} from "../controllers/productController.js";
import { authenticate, authorize, validateProduct, validateUpdateProduct, validateId } from "../middleware/index.js";

// client
router.get('/',homePage); 

// [GET] Hiển thị form thêm sản phẩm
router.get('/products/add', showAddForm);

// [POST] Thêm sản phẩm từ form EJS
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});
const upload = multer({ storage });
router.post('/products/add', upload.single('image'), handleAddProduct);
// Hiển thị form sửa
router.get('/products/:id/edit', showEditForm);
// Xử lý form sửa
router.post('/products/:id/edit', upload.single('image'), handleUpdateProduct);
// Xóa sản phẩm
router.post('/products/:id/delete', handleDeleteProduct);



////////////////////////////////////////////// API ////////////////////////////////
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
