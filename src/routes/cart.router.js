import express from 'express';
import cartModel from '../models/carts.model.js';
import ProductModel from "../models/products.model.js";

const router = express.Router();

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await cartModel.findOne({ isDefault: true });
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito por defecto no encontrado' });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);

        await cart.save();
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);

        if (productIndex > -1) {
            cart.products[productIndex].quantity = req.body.quantity;
            await cart.save();
            res.json({ status: 'success', cart });
        } else {
            res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = req.body.products;
        await cart.save();
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid);

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = [];
        await cart.save();
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartModel.findById(req.params.cid).populate('products.product');

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.render('cartDetails', { cart });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

router.post('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;

        const product = await ProductModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        const cart = new CartModel({ products: [{ product: pid }] });
        await cart.save();

        res.json({ status: 'success', message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

export default router;
