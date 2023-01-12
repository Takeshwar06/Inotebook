const express=require('express');
const User=require("../models/User"); //grap export file
//like--> let User=localStorage("user",UserShema);
const router=express.Router(); 
const bcrypt=require('bcryptjs');
const {body,validationResult}=require("express-validator"); // as like #include for inbuild function
const jwt=require('jsonwebtoken')
const fetchuser=require('../middleware/fetchuser')

const JWT_SECRET="tigerisagoodb$oy";   // jwt authentication
// router.post('/',(req,res)=>{
//    console.log(req.body);
//   const user=User(req.body);
//   user.save(); 
//    res.send(req.body);
// })

// ROUTE 1.Create a user using: POST "/api/auth/createuser"  no login required
router.post('/createuser',[
  body("name","msg--name").isLength({min:3}),
  body("email","msg--email").isEmail(),
  body("password","msg--pass.").isLength({min:5}),
]  ,async (req,res)=>{
   // if there are error return bad request
   let success=false;
   const errors=validationResult(req);
   if(!errors.isEmpty()){
      return res.status(400).json({errors:errors.array()});
   } 
   
   // cheaking whether the user with this email exists already
   try{
      let user = await User.findOne({email:req.body.email}); // if  present return 1 else 0
   if(user){
      return res.status(400).json({error:"sorry a user with this email already exists"})
   }

   // using bcrypt for secure password 
   const salt=await bcrypt.genSalt(10);
   const recpass=await bcrypt.hash(req.body.password,salt);

   // create a new user
 user = await User.create({
      name:req.body.name,
      email:req.body.email,
      password:recpass,
   })

   const data={
      user:{
         id:user.id  // id for faster retreving
      }
   }

   const authtoken=jwt.sign(data,JWT_SECRET);  // when a user create generate authtoken with respect to data-->user-->user.id and JWT_SECRET
   success=true;
   console.log(success,authtoken);
   
   // res.json(user);

   res.json({success,authtoken})  // using ES6 concept --> no need to write <{authtoken:authtoken}> 
   // using authtoken --> get data && using JWT_SECRET-->know about changes in authtoken
   }catch(err){
      console.log(err.message);
      res.status(500).send("Internal Server Error");
   }
   

// using--> .then and .catch && doesn't require this if you are using async function 
   // User.create({
   //    name:req.body.name,
   //    email:req.body.email,
   //    password:req.body.password,
   // }).then(user=>res.json(user)).catch(err=>res.json({error:"Please insert unique value"})) // insert data in db and it has return value that is data 
   // // user stores return value after inserting data in db 

})

// ROUTE 2.authenticate a user using: POST "/api/auth/login"  no login required

router.post('/login',[
   body("email","msg--email").isEmail(),
   body("password","msg--pass--empt.").exists(),
 ]  ,async (req,res)=>{
    // if there are error return bad request
    let success=false;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
       return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;  // destructuring for get email and pass. in req.body

    try{
      
      const user=await User.findOne({email});  // user is object of a user data
      if(!user){  // when email not exist in collections
         return res.status(400).json({error:"please try to login with correct credentials"})
      }
      
      const passwordCompare=await bcrypt.compare(password,user.password);
      if(!passwordCompare){
         return res.status(400).json({error:"please try to login with correct credentials"})
      }

      const data={
         user:{
            id:user.id  // id for faster retreving
         }
      }
   
      const authtoken=jwt.sign(data,JWT_SECRET);  
      success=true;
      console.log(authtoken);
      res.json({success,authtoken});

    }catch(err){
      console.log(err.message);
      res.status(500).send("Internal Server Error");
   }
   
})

// ROUTE 3.get loggedin user details using: POST "/api/auth/getuser"   login required
router.post('/getuser',fetchuser,async (req,res)=>{
 
    try{
     userId=req.user.id;
     const user=await User.findById(userId).select("-password");
     res.send(user);

    }catch(err){
      console.log(err.message);
      res.status(500).send("Internal Server Error");
   }
   
 })

module.exports=router;                           