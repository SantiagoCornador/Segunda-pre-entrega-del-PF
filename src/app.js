import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { create } from 'express-handlebars';
import mongoose from 'mongoose';
import __dirname from './utils.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import chatRouter from './routes/chat.router.js';
import viewsRouter from './routes/views.router.js';
import Message from './models/message.model.js';
import path from 'path';
import Handlebars from 'handlebars';
import CartModel from './models/carts.model.js';



const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8080;

const hbs = create({
    extname: '.handlebars',
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://santiagocornador:Blondie1218@cluster0.9ho1w2l.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => { console.log("Conectado a la base de datos") })
    .catch(error => console.error("Error en la conexion", error));

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/favicon.ico', (req, res) => res.status(204).end());

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

app.use('/', productRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/realtimeproducts', productRouter); 
app.use('/chat', chatRouter); 
app.use('/', viewsRouter);

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    try {
        const messages = await Message.find().lean();
        socket.emit('loadMessages', messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }

    socket.on('chatMessage', async (data) => {
        try {
            const newMessage = new Message(data);
            await newMessage.save();
            io.emit('chatMessage', data);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('cartUpdated', async (cart) => {
        io.emit('updateCart', cart);  
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });


});

app.set('socketio', io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
