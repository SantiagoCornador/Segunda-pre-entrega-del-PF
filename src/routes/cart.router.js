import express from 'express';
import CartModel from '../models/carts.model.js';
import ProductModel from '../models/products.model.js';

const router = express.Router();

router.post('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const clientId = req.clientId;
        const product = await ProductModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        let cart = await CartModel.findOne({ clientId });
        if (!cart) {
            cart = new CartModel({
                clientId,
                products: [{ product: pid, quantity: 1 }]
            });
        } else {
            const productInCart = cart.products.find(item => item.product.toString() === pid);
            if (productInCart) {
                productInCart.quantity += 1;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }
        }

        await cart.save();

        req.io.emit('updateCart', cart);

        res.status(201).json({ status: 'success', message: 'Producto agregado al carrito', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al agregar producto al carrito' });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();

        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar producto del carrito' });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = products;
        await cart.save();

        res.json({ status: 'success', message: 'Carrito actualizado', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el carrito' });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productInCart = cart.products.find(item => item.product.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado en el carrito' });
        }

        productInCart.quantity = quantity;
        await cart.save();

        res.json({ status: 'success', message: 'Cantidad actualizada', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar la cantidad del producto' });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        const cart = await CartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        cart.products = [];
        await cart.save();

        res.json({ status: 'success', message: 'Todos los productos eliminados del carrito', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al eliminar productos del carrito' });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await CartModel.findById(cid).populate('products.product');

        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        res.render('cartDetails', { cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al obtener el carrito' });
    }
});

router.get('/', async (req, res) => {
    try {
        const carts = await CartModel.find();
        res.json({ status: 'success', carts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los carritos' });
    }
});

export default router;
