import mongoose from 'mongoose';


const dbconnect = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("database connected succesfully")
    }catch(err){
        console.log("database error =>",err)
        process.exit(1)
    }
}

export default dbconnect;