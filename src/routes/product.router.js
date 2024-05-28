import { Router } from "express";
import productModel from "../models/products.model.js";

const router = Router();

router.get('/', async (req, res) => {
    try {
        let products = await productModel.find().lean();
        res.render('home', { productos: products });
    } 
    catch (error) { 
        console.log(error);
        res.status(500).send("Error al obtener los productos");
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        let products = await productModel.find().lean();
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
      let result = await productModel.create({ title, description, code, price, stock, category });
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
        let result = await productModel.updateOne({ _id: pid }, userToReplace);
        res.send({ result: "success", payload: result });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).send({ error: 'Error al actualizar producto' });
    }
});

router.delete('/:pid', async (req, res) => {
    let { pid } = req.params;
    try {
        let result = await productModel.deleteOne({ _id: pid });
        req.io.emit('productDeleted', pid); 
        res.send({ result: "success", payload: result });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).send({ error: 'Error al eliminar producto' });
    }
});

export default router;
