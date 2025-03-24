const express = require('express');
const app=express();
const  bodyParser=require('body-parser')
const cors= require('cors'); 
const AutherRouter=require('./Routes/AuthRouter')


require('dotenv').config();
require('./Models/db');



const PORT=process.env.PORT || 8080;


app.use(bodyParser.json());
app.use(cors());
app.use('/auth', AutherRouter);

app.get('/ping' , (req , res)=>{
    res.send('PONG');
})
app.listen(PORT , ()=>{
    console.log(`Server is listening on ${PORT}`);
})