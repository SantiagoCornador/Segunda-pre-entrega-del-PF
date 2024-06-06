import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    stock: Number,
    category: String,
    availability: Boolean,
});

productSchema.index({ title: 'text', description: 'text', code: 'text', category: 'text', availability: 'text' });

productSchema.plugin(mongoosePaginate);

const ProductModel = mongoose.model('Producto', productSchema, 'productos');

export default ProductModel;


