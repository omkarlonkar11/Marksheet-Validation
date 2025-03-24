const Joi= require('joi');
const signupValidation=(req ,res , next)=>{
    const schema=Joi.object({
        name:Joi.string().min(3).max(100).required(),
        email :Joi.string().email().required(),
        password:Joi.string().min(6).max(15).required(),
    });
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400)
        .json({message:"Bad Request" , error})
    }
    next();
}
const LoginValidation=(req ,res , next)=>{
    const schema=Joi.object({

        email :Joi.string().email().required(),
        password:Joi.string().min(6).max(15).required(),
    });
    const {error} = schema.validate(req.body);
    if(error){
        return res.status(400)
        .json({message:"Bad Request" , error})
    }
    next();
}
module.exports={
    signupValidation ,
    LoginValidation
}