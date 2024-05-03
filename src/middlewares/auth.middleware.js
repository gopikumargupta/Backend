import { User } from "../models/userModule.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'




export const verifyJWT=asyncHandler(async(req,res,next)=>{
   try {
    // const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    const token= req.cookies?.accessToken
    if(!token){
     throw new ApiError(401,"unauthiried request");
    }
   const decodedtoken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   const user= await User.findById(decodedtoken?._id).select("-password -refreshToken")
 
   if(!user){
     throw new ApiError(401,"invalid acces token")
   }
   req.user=user;
   next()
   } catch (error) {
    throw new ApiError(401,error?.message||"invalid access token")
    
    
   }
})
