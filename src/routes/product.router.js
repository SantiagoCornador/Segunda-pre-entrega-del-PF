import { Router } from "express";
import ProductModel from "../models/products.model.js";
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
        };

        const filterQuery = query ? String(query).trim() : '';
        const filter = {};

        if (filterQuery) {
            filter.$or = [
                { category: { $regex: filterQuery, $options: 'i' } },
                { title: { $regex: filterQuery, $options: 'i' } }
            ];
        }

        const products = await ProductModel.paginate(filter, options);


        const totalPages = products.totalPages;
        const paginationPages = [];
        for (let i = 1; i <= totalPages; i++) {
            paginationPages.push(i);
        }

        res.render('home', {
            productos: products.docs,
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage ? `/api/products?limit=${limit}&page=${products.prevPage}&sort=${sort}&query=${query}` : null,
            nextLink: products.hasNextPage ? `/api/products?limit=${limit}&page=${products.nextPage}&sort=${sort}&query=${query}` : null,
            query,
            sort,
            paginationPages 
        });
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ status: 'error', message: 'Error al obtener los productos' });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        let products = await ProductModel.find().lean();
        res.render('realTimeProducts', { productos: products });
    } catch (error) {
        console.log(error);
        res.status(500).send("Error al obtener los productos");
    }
});

router.post('/', async (req, res) => {
    let { title, description, code, price, stock, category } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.send({ status: 'error', error: 'Faltan parametros' });
    }

    try {
        let result = await ProductModel.create({ title, description, code, price, stock, category });
        req.io.emit('newProduct', result);
        res.send({ result: 'success', payload: result });
    } catch (error) {
        console.error('Error al agregar producto:', error);
        res.status(500).send({ error: 'Error al agregar producto' });
    }
});

router.put('/:pid', async (req, res) => {
    let { pid } = req.params;

    let userToReplace = req.body;

    if (!userToReplace.title || !userToReplace.description || !userToReplace.code || !userToReplace.price || !userToReplace.stock || !userToReplace.category) {
        res.send({ status: "error", error: "Parametros no definidos" });
        return;
    }
    try {
        let result = await ProductModel.updateOne({ _id: pid }, userToReplace);
        res.send({ result: "success", payload: result });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).send({ error: 'Error al actualizar producto' });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.pid).lean();
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.render('productDetails', { product, cartId: req.query.cartId });
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    let { pid } = req.params;
    try {
        let result = await ProductModel.deleteOne({ _id: pid });
        req.io.emit('productDeleted', pid);
        res.send({ result: "success", payload: result });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).send({ error: 'Error al eliminar producto' });
    }
});

export default router;
