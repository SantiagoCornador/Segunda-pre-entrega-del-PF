import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CartSchema = new Schema({
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                required: true
            }
        }
    ],
    isDefault: {
        type: Boolean,
        default: false
    }
});

const CartModel = mongoose.model('Cart', CartSchema);

export default CartModel;
