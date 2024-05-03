import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'
const app=express();

// cores (cross origin resource sharing  )

app.use(cors({
    origin:process.env.CORS,
    Credential:true
}))
// accepting json using express json

app.use(express.json({limit:'16kb'}))

// url data accepting
app.use(express.urlencoded({extended:true,limit:'16kb'}))

// file store in public asset
app.use(express.static('public'))

//CRUD opration of cookie in brouser using cokie parser
app.use(cookieParser())



//importing router
import userRouter from './routes/user.routes.js'


//router initilizing
app.use('/users',userRouter)




export {app}