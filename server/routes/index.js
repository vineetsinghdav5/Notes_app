const express = require('express');
const router = express.Router();
const maincontroller = require('../controllers/maincontroller')

/**
 * app routes
*/
router.get('/',maincontroller.homepage);
router.get('/about',maincontroller.about);

module.exports = router;