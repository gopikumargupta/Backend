import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/apiError.js'
import {User} from '../models/userModule.js'
import {uploadOnCloudinary} from '../utils/cloudnery.js'
import jwt from 'jsonwebtoken'

import {ApiResponse} from "../utils/apiResponse.js"
import mongoose from 'mongoose'


const generateAccessAndRefereshToken=async(userId)=>{
    try 
     {
      
        const user = await  User.findById(userId)
        
        
        
       
        const accessToken= await user.generateAccessToken()

        
        const refreshToken= await user.generateRefreshToken()
        
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        
        return {accessToken,refreshToken}
        
        
      }
      catch (error) {
        
        throw new ApiError(500,"something went wrong while genrating refresh token")
        
        
      }

}


const registerUser= asyncHandler(async(req,res)=>{
   //get user details
   //validation on user
   // check if user already exixt using username,email
   // cheack for img and avtar
   //upload them in cloudnery,avtaror not
   //create object in create 
   //remove pass and refresh token field 
   //cheack for user creation
   //return response
   const {username,email,fullName,password}=req.body

   //i can write this   

  /* if(fullName===""){
    throw new ApiError(400,"fullname is require")

   }*/

   //2nd method 

   if([fullName,email,username,password].some((field)=> field?.trim()==="")){
    throw new ApiError(400,"ALl field are rquired")
   }
    const existedUser= await User.findOne({
    $or:[{username},{email}]
   })
   if(existedUser){
    throw new ApiError(409,"user already found")
   }
  const avtarLocalpath=req.files?.avtar[0]?.path;
 //   const coverImageLocalpath=req.files.coverImage[0].path;

  if(!avtarLocalpath){
    throw new ApiError(400,"avtar file is require");
  }
  
  
  const avtar = await uploadOnCloudinary(avtarLocalpath);
  let coverImageLocalpath;
  if(req.files&&Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
    coverImage=req.files.coverImage[0].path

  }
  const coverImage= await uploadOnCloudinary(coverImageLocalpath)
  

  if(!avtar){
    throw new ApiError(400,"avtar is required")
  }
  const user= await User.create({
    fullName,
    avtar:avtar.url,
    coverImage:coverImage?.url||"",
    email,
    password,
    username:username.toLowerCase(),


  })
  const checkuser= await User.findById(user._id).select(
    "-password -refreshTokern"
  )
  if(!checkuser){
    throw new ApiError(500,"something went wrong while registring user")
  }

  return res.status(201).json(new ApiResponse(200,checkuser,"User Registerd succesfully"))







  

  




   

})

const loginUser=asyncHandler(async(req,res)=>{

    //req body se data le aao
    //username or email
    //find the user in db
    //password cheak krwao
    //access and refresh token genrate krenge
    //send cookie and response sucessfully login
    const{email,password,username}=req.body

    if(!username&&!email){
        throw new ApiError(400,"username and paswoord is require")
    }
    const user=await User.findOne({
        $or:[{username},{email}]
    })
    if(!user){
        throw  new ApiError(404,"user does not exixst")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid password")
    }
    const {refreshToken,accessToken}=await generateAccessAndRefereshToken(user._id)

    const loggedInUser=await User.findById(user._id).select('-password -refreshToken')

    const opsation={
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .cookie('accessToken',accessToken,opsation)
    .cookie('refreshToken',refreshToken,opsation)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logeed in succesfully"
        )
    )




})
const logoutUser=asyncHandler(async(req,res)=>{
  

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )
  const opsation={
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie('accessToken',opsation).clearCookie('refreshToken',opsation).
  json(new ApiResponse(200,{},"Logout succesfuly"))
    
})

const refreshaccestoken=asyncHandler(async(req,res)=>{
  try {
    const incomingrefreshtoken=req.cookies.refreshToken||req.body.refreshToken;
  
    if(!incomingrefreshtoken) {
      throw ApiError(401,"unauthorised request")
    }
  
    const decodedToken=jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET)
    const user=await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }
    if(incomingrefreshtoken!==user.refreshToken){
      throw new ApiError(401,"refresh token is expired and used")
  
  
    }
    const opsation={
      httpOnly:true,
      secure:true
    }
     const {accessToken,newrefreshToken}=await generateAccessAndRefereshToken(user._id)
  
    return res.status(200).
    cookie('accessToken',accessToken,opsation).
    cookie('refreshToken',newrefreshToken.opsation).
    json(
      new ApiResponse(
        200,
        {accessToken,refreshToken:newrefreshToken},
        "Access token refreshed succesfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,error?.message||"invalid refresh token")
    
  }
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
   const {oldPassword,newPassword,confpassword} =req.body;
   if(!(newPassword===confpassword)){
    throw new ApiError(401,"new password and conform password not maching")
   }

    const user =await User.findById(req.user?._id)
    console.log(req.user?._id)

   const cheakpassword=await user.isPasswordCorrect(oldPassword)

 if(!cheakpassword){
    throw new ApiError(400,"Invalid old password")
  }
  user.password=newPassword;
  await user.save({
    validateBeforeSave:false
  })
  return res.status(200).json(new ApiResponse(200,{},"Password Changed Succesfully"))


})

const CurentUser=asyncHandler(async(req,res)=>{
  const user=req.user;

  return res.status(200).
  json(new ApiResponse(200),user,"user feached succesfully")
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const{fullName,email}=req.body;
  if(!fullName||email){
    throw new ApiError(400,"All fields are required")
  }
  const user=await User.findByIdAndUpdate(req.user?._id,
      {
        $set:{
          fullName,
          email,

        }
      },{new:true}).select("-password")



  return res.status(200).json(new ApiResponse(200,user,"account details updated succesfully"))




  


})


const updateUserAvtar=asyncHandler(async(req,res)=>{
  const avtarlocalpath=req.file?.path

  if(!avtarlocalpath){
    throw new ApiError(400,"avtar file error")
  }
  const avtar=await uploadOnCloudinary(avtarlocalpath)
  if(!avtar.url){
    throw new ApiError(400,"error while uploading on avtar")

  }
  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        avtar:avtar.url
      }
    },{new:true}).select("-password")

    req.status(200).
    json(new ApiResponse(200,user,"avtar updated succesfully"))
})
const updateUsercover=asyncHandler(async(req,res)=>{
  const coverlocalpath=req.file?.path

  if(!coverlocalpath){
    throw new ApiError(400,"cover file error")
  }
  const cover=await uploadOnCloudinary(coverlocalpath)
  if(!cover.url){
    throw new ApiError(400,"error while uploading on avtar")

  }
  const user=await User.findByIdAndUpdate(req.user?._id,
    {
      $set:{
        coverImage:cover.url
      }
    },{new:true}).select("-password")

    req.status(200).
    json(new ApiResponse(200,user,"cover updated succesfully"))
})

export {registerUser,loginUser,logoutUser,refreshaccestoken,changeCurrentPassword,CurentUser,updateUserAvtar,updateUsercover,updateAccountDetails}