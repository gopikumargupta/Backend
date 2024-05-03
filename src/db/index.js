import mongoose from "mongoose";



import {DB_NAME} from '../constant.js'



const dbConnct=async()=>{

    try {
         const connection=await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`)
        console.log(`\n MongoDb connected !! DB HOST: ${connection.connection.host}`)
        // console.log(connection)
        
    } catch (error) {
        console.log('ERR:',error);
        process.exit(1)
        
    }

}
export default dbConnct