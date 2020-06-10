const express = require('express');
const app = express();
const productsRouter = require('./routes/productsRouter');
const usersRouter =require('./routes/usersRouter');
const wishlistRouter = require('./routes/wishlistRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require("./controllers/errorController");
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
var cors = require('cors');
app.use(cookieParser())



app.use(bodyParser.json())
app.use(bodyParser.json());
app.use(cors());
app.use('/api/v1/test', (req, res) => res.send('Hello World!'))
app.use('/api/v1/', productsRouter);
app.use('/api/v1/users/',usersRouter);
app.use('/api/v1/wishlist/', wishlistRouter);

 app.use(globalErrorHandler);

module.exports = app;