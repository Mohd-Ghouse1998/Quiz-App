let userModel = require("../models/userModel");
let validate = require("./validator");
let jwt=require('jsonwebtoken')


let createUser = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).send({
        status: false,
        error: true,
        message: "Please enter manadatory details",
      });
      return;
    }

    let userExists = await userModel.findOne({ name });

    if (userExists) {
      res
        .status(400)
        .send({ status: false, error: true, message: "Name already exist!" });
      return;
    }

    if (!validate.isValidEmail(email)) {
      res
        .status(400)
        .send({ status: false, message: `${email} is not a valid email` });
      return;
    }

    let emailExists = await userModel.findOne({ email });

    if (emailExists) {
      res
        .status(400)
        .send({ status: false, error: true, message: "Email already exist!" });
      return;
    }

    if (!(password.length >= 3) && password.length <= 15) {
      res
        .status(400)
        .send({ status: false, message: "password length must be 8 to 15" });
      return;
    }

    let userData = {
      name,
      email,
      password,
    };

    let saveUserData = await userModel.create(userData);

    res.status(201).send({
      status: true,
      message: "user successfully registerd",
      data: saveUserData,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const login = async function (req, res) {
  try {
    // Extract params
    const { email, password } = req.body;
    // Validation starts
    if (!validate.isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: `Email is required` });
    }

    if (!validate.isValidEmail(email)) {
      res
        .status(400)
        .send({ status: false, message: `${email} is not a valid email` });
      return;
    }

    if (!validate.isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: `Password is required` });
    }
    // Validation ends
    const user = await userModel.findOne({ email,password });
    // const userId = user._id

    if (!user) {
      return res
        .status(401)
        .send({ status: false, message: `Invalid login credentials` });
    }

    
      const token = jwt.sign({ userId: user._id }, "radium", {
        expiresIn: "10h",
      });

      return res.status(200).send({
        status: true,
        message: `User login successfull 😁🤟🏻`,
        data: { userId: user._id, token },
      });
    
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};


const getUser=async (req,res)=>{
try{
    let userId=req.params.userId

    let userData=await userModel.find({_id:userId})

    res.send({status:true,error:false,data:userData})
}catch(error){
  res.send({status:false,error:true,message:error.message})
  return 
}
}

module.exports={createUser,login,getUser}