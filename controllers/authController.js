const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const server = require('../server');
const bcrypt = require('bcrypt');


const signToken = (id, firstName) => {
    return jwt.sign({ id, firstName }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.firstName);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    //remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const data = await req.body[0]
    if (data.password !== data.passwordConfirm) {
        return next(new AppError('Parolele nu corespund', 400));

    }
    data.passwordConfirm = undefined;

    data.password = await bcrypt.hash(data.password, 12);

    server.connection.query('INSERT INTO users SET ?', data, (err, result) => {

        if (err) {
            return next(new AppError('The email is already in use', 500));
        }
        const newUser = {
            id: result.insertId,
            firstName: data.firstName
        };
        createSendToken(newUser, 201, res);
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const data = await req.body[0];
    const { email, password } = data;
    let userPassword = '';
    // check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    //check if user exists and password is correct
    const query = `SELECT * from users WHERE email='${email}';`
    server.connection.query(query, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: 'A avut loc o eroare',
                error: err
            });
            return
        }
        if (result.length) {
            userPassword = result[0].password;
            (async () => {
                const value = await bcrypt.compare(password, userPassword);
                if (!value) return next(new AppError('Incoreect email or password', 401));
                const user = {
                    id: result[0].id,
                    firstName: result[0].firstName,
                };
                createSendToken(user, 200, res);
            })()
        } else {
            return next(new AppError('Incoreect email or password', 401));
        }
    })

})

exports.protect = catchAsync(async (req, res, next) => {
    //1 getting token and check of it s there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) {
        
        return next(new AppError('Please log in to continue this action', 401));
    }

    //2 verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
 
    //3 check if user still exists
    const query = `SELECT * FROM users where id=${decoded.id}`;
    server.connection.query(query, (err, result) => {
        if (err) {
            res.send({
                success: false,
                message: 'A avut loc o eroare',
                error: err
            });
            return
        }
        if (!result.length) {
            return next(new AppError('The user beloging to this token does no longer exists', 401));
        }
        const currentUser = result[0];
        const password_modification_time = result[0].password_modification_time;
        const JWTTimestamp = decoded.iat;
        //4 check if user changed password after the token was issued
        if (password_modification_time) {
            const password_modification_time_timestamp = Date.parse(password_modification_time) / 1000;
            
            if (JWTTimestamp < password_modification_time_timestamp) {
                return next(new AppError('User recently changed password! Please log in again', 401));
            }
        }
        //grat acces to protected route
        req.user = currentUser;
        next()
    });
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    //1 getting token if exists and check it
    if (req.cookies.jwt) {
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
        //3 check if user still exists
        const query = `SELECT * FROM users where id=${decoded.id}`;
        server.connection.query(query, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: 'A avut loc o eroare',
                    error: err
                });
                return
            }
            if (!result.length) {
                return next();
            }
            const currentUser = result[0];
            const password_modification_time = result[0].password_modification_time;
            const JWTTimestamp = decoded.iat;

            //4 check if user changed password after the token was issued
            if (password_modification_time) {
                const password_modification_time_timestamp = Date.parse(password_modification_time) / 1000;
                if (JWTTimestamp < password_modification_time_timestamp) {
                    return next();
                }
            }

            //grat acces to protected route
            req.user = currentUser.firstName;
            
            res.status(200).json({
                status: "success",
                user: req.user
            });
        });
    } else {
        return next(new AppError('The user is not logged in', 401));
    }
   
})

exports.loggout = catchAsync(async (req, res) => {
    const cookieOptions = {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', 'logOut', cookieOptions);
    res.status(200).json({ status: 'success' });
})