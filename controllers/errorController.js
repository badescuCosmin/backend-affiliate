const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational trusted errors, send message to the client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    } else {
        //log error
        console.log(err);

        //sent generic message;
        res.status(500).json({
            status:"error",
            message:'Something went very wrong'
        });
    }
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status     = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        console.log("development")
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        console.log("production")
        let error = {...err};
        sendErrorProd(error, res);
    }
};