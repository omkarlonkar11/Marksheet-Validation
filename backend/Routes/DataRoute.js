const express = require('express');
const postdata = require('../Controllers/PostDataController');
const router = express.Router();

router.post('/add', postdata);

module.exports = router;
