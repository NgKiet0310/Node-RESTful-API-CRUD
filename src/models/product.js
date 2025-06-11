import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // bắt buộc
        trim: true, // xóa khoảng trắng thừa
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
productSchema.index({ name:1 });

// tạo model từ schema
const Product = mongoose.model('Product', productSchema );

export default Product;