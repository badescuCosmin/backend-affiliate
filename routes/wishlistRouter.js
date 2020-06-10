const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authController = require('../controllers/authController');

router.route('/addToWishlist').post(authController.protect, wishlistController.addToWishlist);

router.route('/getWishlisItems').get(authController.protect, wishlistController.getWishlisItems);

router.route('/getWishlistNumberItems').get(authController.protect, wishlistController.getWishlistNumberItems)

router.route('/deleteWishlistItem').post(authController.protect, wishlistController.deleteWishlistItem)

module.exports = router;