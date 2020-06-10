const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const utilsController = require('../controllers/utilsController');


router.route('/products/:type/:subcategory/:sort/:page/:limit').get(productsController.getProducts, utilsController.paginatedResults, productsController.exportFiltredProducts);
router.route('/products/:type').get(productsController.getMostWanted);
router.route('/products/newest/:type').get(productsController.getNewest);
router.route('/categories/:id').get(productsController.getAllCategories, utilsController.filterCategories, productsController.getFilteredCategories);


module.exports = router;