
import mongoose, {Schema} from "mongoose";

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const UserSchema=new Schema({
    username:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true

    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true

    },
    avtar:{
        type:String,
        require:true
    },
    coverImage:{
        type:String

    },
    refreshToken:{
        type:String
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        require:[true,'Password is Require']
    }

},{timestamps:true})

UserSchema.pre('save', async function(next){
    if (!this.isModified('password')) return next();
    this.password= await bcrypt.hash(this.password,11);
    next()


})
UserSchema.methods.isPasswordCorrect=async function (password){
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
    {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )

}
UserSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
    {
        _id:this._id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
    
}
export const User =mongoose.model('User',UserSchema);