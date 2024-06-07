import express from 'express';
import Product from '../models/products.model.js';
import CartModel from '../models/carts.model.js';

const router = express.Router();


router.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true
        };
        const products = await Product.paginate({}, options);
        const pages = Array.from({ length: products.totalPages }, (v, k) => k + 1);

        res.render('products', {
            products: products.docs,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            pages
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});


router.get('/cart/:cid', async (req, res) => {
    const cartId = req.params.cid;
    try {
        const cart = await CartModel.findById(cartId).populate('products.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.render('cart', { cart });
    } catch (error) {
        console.error('Error al obtener carrito:', error);
        res.status(500).json({ error: 'Error al obtener carrito' });
    }
});

export default router;
