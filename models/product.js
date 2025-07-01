import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // bắt buộc
        trim: true, // xóa khoảng trắng thừa
    },
    image: {
        type: String, // tên file ảnh, không phải đường dẫn đầy đủ
        required: false, // ảnh không bắt buộc
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        trim: true,    // có thể thêm trim để bỏ khoảng trắng thừa
        required: false, // không bắt buộc
    },
    description: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // mặc định là thời gian hiện tại
    },
});
// 🔍 Index tìm kiếm theo tên (dùng $text)
productSchema.index({ name: "text" });

// 💰 Lọc theo khoảng giá
productSchema.index({ price: 1 });

// 📊 Thống kê / lọc theo category
productSchema.index({ category: 1 });

// 🕓 Sắp xếp theo ngày tạo mới nhất
productSchema.index({ createdAt: -1 });


// tạo model từ schema
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);


export default Product;