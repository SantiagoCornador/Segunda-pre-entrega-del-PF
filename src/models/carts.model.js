import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: Number,
    quantity: Number
});

const cartSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    products: [productSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
