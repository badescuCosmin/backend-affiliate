const dotenv = require('dotenv');
dotenv.config({path:"./conf.env"});

var mysql = require('mysql');
const app = require('./app');
const port = process.env.PORT;

exports.connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

app.listen(port, () => {
    console.log(`app started at port ${port}`);
});