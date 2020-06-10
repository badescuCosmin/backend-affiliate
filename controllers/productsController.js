const server = require('../server');

exports.getProducts = (req, res, next) => {
    const { type, category, subcategory, sort } = req.params;
    let q = ''
    if (sort === 'popularity') {
        q = `SELECT * FROM products where product_type = '${type}' AND product_subcategory='${subcategory}'ORDER BY product_likes DESC `;
    } else if (sort === 'height') {
        q = `SELECT * FROM products where product_type = '${type}' AND product_subcategory='${subcategory}'ORDER BY product_price DESC `;
    } else if (sort === 'low') {
        q = `SELECT * FROM products where product_type = '${type}' AND product_subcategory='${subcategory}'ORDER BY product_price`;
    }
    server.connection.query(q, (error, rows, fields) => {
        if (error) {
            res.sendStatus(500);
            res.end();
            return
        }
        const data = {
            results: rows.length,
            status: 'succes',
            data: {
                rows
            }
        };
        req.data = data;
        next()

    });
}

exports.exportFiltredProducts = (req, res) => {
    res.status(200).json({
        nrPages: req.data.totalNrPages,
        paginationResults: req.data.paginatedResults,
        status: 'succes',
        data: {
            rows: req.data.data.rows
        },
        next: req.data.next,
        previous: req.data.previous
    });
}

exports.getMostWanted = (req, res) => {
    const { type } = req.params;
    const q = `SELECT * FROM products WHERE product_type = '${type}' ORDER BY product_likes DESC LIMIT 4`;
    server.connection.query(q, (error, rows, fields) => {
        if (error) {
            res.sendStatus(500);
            res.end();
            return
        }
        res.status(200).json({
            results: rows.length,
            status: 'succes',
            data: {
                rows
            }
        });
    });
}


exports.getNewest = (req, res) => {
    const { type } = req.params;
    const q = `SELECT * FROM products WHERE product_type = '${type}' ORDER BY creation_time DESC LIMIT 4`;
    server.connection.query(q, (error, rows, fields) => {
        if (error) {
            res.sendStatus(500);
            res.end();
            return
        }
        res.status(200).json({
            results: rows.length,
            status: 'succes',
            data: {
                rows
            }
        });
    });
}

exports.getAllCategories = (req, res, next) => {
    const q = `SELECT * FROM categories WHERE category_type='${req.params.id}'`;
    server.connection.query(q, (error, rows, fields) => {
        if (error) {
            res.sendStatus(500);
            res.end();
            return
        }
        const data = {
            results: rows.length,
            status: 'succes',
            data: {
                rows
            }
        }
        req.data = data;
        next();
    });
}

exports.getFilteredCategories = (req, res) => {
    res.status(200).json({
        status: 'succes',
        data: req.data        
    });
}



