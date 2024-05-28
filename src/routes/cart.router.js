import express from 'express';
import Cart from '../models/carts.model.js'; 

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { products } = req.body;
        const lastCart = await Cart.findOne().sort({ id: -1 }).exec();
        const id = lastCart ? lastCart.id + 1 : 1;
        const newCart = new Cart({ id, products });
        const savedCart = await newCart.save();
        res.json(savedCart);
    } catch (error) {
        console.error('Error al crear carrito:', error);
        res.status(500).json({ error: 'Error al crear carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    try {
        const cart = await Cart.findOne({ id: cartId }).exec();
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.json(cart.products);
    } catch (error) {
        console.error('Error al obtener productos del carrito:', error);
        res.status(500).json({ error: 'Error al obtener productos del carrito' });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const { quantity } = req.body;
    try {
        const cart = await Cart.findOne({ id: cartId }).exec();
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        const existingProduct = cart.products.find(item => item.id === productId);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ id: productId, quantity });
        }
        const updatedCart = await cart.save();
        res.json(updatedCart);
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

export default router;
