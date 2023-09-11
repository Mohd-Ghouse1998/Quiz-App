const mongoose=require('mongoose')

const connectDb=async ()=>{
try{


    let conn=await mongoose.connect('mongodb://localhost:27017/QuizGame',{
        useNewUrlParser: true,
        useUnifiedTopology: true
        
      })

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`connection error ${error.message}`);
    }

}

module.exports=connectDb