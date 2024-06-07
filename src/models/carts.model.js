import mongoose from 'mongoose';
const { Schema } = mongoose;

const cartSchema = new Schema({
    products: [{
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 }
    }]
});

const CartModel = mongoose.model('Cart', cartSchema);

export default CartModel;
