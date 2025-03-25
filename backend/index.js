const express = require('express');
const app=express();
const  bodyParser=require('body-parser')
const cors= require('cors'); 
const AutherRouter=require('./Routes/AuthRouter')
const PosterRouter=require('./Routes/DataRoute');


require('dotenv').config();
require('./Models/db');



const PORT=process.env.PORT || 8080;


app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AutherRouter);
app.use('/semester' , PosterRouter);
app.listen(PORT , ()=>{
    console.log(`Server is listening on ${PORT}`);
})