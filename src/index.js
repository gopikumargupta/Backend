import dotenv from 'dotenv'
import dbConnct from "./db/index.js";
import {app} from './app.js'
dotenv.config({
  path:'./.env'
})

dbConnct().
then(()=>{
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`Server is Running at Port : ${process.env.PORT}`)
    })
    
}).
catch((e)=>console.log('Dbconnection fail',e))