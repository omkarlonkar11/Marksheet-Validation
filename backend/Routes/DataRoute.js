// const { models } = require('mongoose');
// const { signupValidation, LoginValidation } = require('../MIddlewares/AuthValidation');

// const router=require('express').Router();

// router.post('/postdata' , postdataValidation , postdata );
// module.exports =router;
const express = require('express');
const postdata = require('../Controllers/PostDataController');
const router = express.Router();

router.post('/add', postdata);

module.exports = router;
