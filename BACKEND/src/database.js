import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

mongoose.set('strictQuery', true) //que sea extricta

//conexion con la base
const connection = async()=>{ 
try{
    await mongoose.connect(process.env.MONGO_DB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
    console.log('✅ Conectado a MongoDB Atlas');
}catch (error) {
    console.error('❌ Error de conexión a MongoDB:', error.message);
    process.exit(1);
    }
}

export default  connection;