const { models } = require('mongoose');
const { signupValidation, LoginValidation } = require('../MIddlewares/AuthValidation');
const { signup, login } = require('../Controllers/AuthController');

const router=require('express').Router();

router.post('/signup' , signupValidation , signup );
router.post('/login' , LoginValidation , login );

module.exports =router;