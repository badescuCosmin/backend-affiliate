const server = require('../server');

exports.addToWishlist = async (req, res) => {
    try {
        const data = await req.body;
        console.log(data)
        data.user_id = req.user.id;
        const dataToSent = {
            product_id: data.productId,
            user_id: req.user.id
        }
        console.log(data.likes, 'to sent')
        server.connection.query('INSERT INTO wishlist SET ?', dataToSent, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: 'db error',
                    error: err
                });
                return
            }
            server.connection.query(`UPDATE products SET product_likes='${data.likes + 1}' WHERE id=${data.productId};`, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        message: 'db error',
                        error: err
                    });
                    return
                }
                res.status(200).json({
                    status: 'succes'
                });
            });
        });
    } catch (err) {
        console.log(err)
    }
}

exports.deleteWishlistItem = (req, res) => {
    try {
        const itemId = req.body.productId;
        const userId = req.user.id;
        const likes =  req.body.likes;
        console.log(likes, 'to sent')
        const q = `DELETE FROM wishlist where user_id = '${userId}' and product_id = '${itemId}'`;
        const queryDeleteLike = `UPDATE products SET product_likes='${likes - 1}' WHERE id=${itemId};`
        server.connection.query(q, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: 'db error',
                    error: err
                });
                return
            }
            console.log('aixi')
            server.connection.query(queryDeleteLike, (err, result) => {
                if (err) {
                    res.send({
                        success: false,
                        message: 'db error',
                        error: err
                    });
                    return
                }
                res.status(200).json({
                    results: result.length,
                    status: 'succes',
                    data: {
                        result
                    }
                });
            });
        });
    } catch (err) {
        console.log(err)
    }
}
exports.getWishlisItems = async (req, res) => {
    const user_id = req.user.id;
    try {
        const q = `select * from products join wishlist on products.id = wishlist.product_id JOIN users on users.id = wishlist.user_id where users.id = ${user_id}`
        server.connection.query(q, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: 'db error',
                    error: err
                });
                return
            }
            res.status(200).json({
                results: result.length,
                status: 'succes',
                data: {
                    result
                }
            });
        });
    } catch (err) {
        console.log(err)
    }
}

exports.getWishlistNumberItems = (req, res) => {
    const user_id = req.user.id;
    try {
        const q = `SELECT COUNT(*) as number FROM wishlist where user_id = '${user_id}'`
        server.connection.query(q, (err, result) => {
            if (err) {
                res.send({
                    success: false,
                    message: 'db error',
                    error: err
                });
                return
            }
            res.status(200).json({
                results: result.length,
                status: 'succes',
                data: {
                    result
                }
            });
        });
    } catch (err) {
        console.log(err)
    }
}
