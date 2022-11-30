const express=require('express');
const router=express.Router();
const mongoose=require('mongoose');
const User=mongoose.model("User");
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}= require('../keys')
const requireLogin=require('../middleware/requireLogin')

router.get('/',(req,res)=>{
    res.send("Home")
    })

router.get('/protected',requireLogin,(req,res)=>{
res.send("Hello FOlks")
})


router.post("/signup",(req,res)=>{
    const {name,email,password} = req.body;
    if(!email||!password||!name){
        return res.status(422).json({error:"Please add all the fields"})
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"User already exists"})
        }
        bcrypt.hash(password,12)
        .then(hasedpassword =>{
            const user=new User({
                email,
                password:hasedpassword,
                name
    
            })
       
        user.save()
        .then(user=>{
            res.json({message:"Successfully added"})
        }).catch(err=>{
            console.log(err)
        })
      })
    }).catch(err=>{
        console.log(err)
    })
})

router.post("/signin",(req,res)=>{
    const {email,password} = req.body;
    if(!email||!password){
        return res.status(422).json({error:"Please add email and password"})
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
             return res.status(422).json({error:"Invalid email or password"})
        }
        bcrypt.compare(password,savedUser.password)//comparing
        .then(doMatch=>{
            if(doMatch){
                // res.json({message:"Successfully signed in"})
            const token=jwt.sign({_id:savedUser._id},JWT_SECRET)
            //pass id,name and email from the savedUser
            const {_id,name,email}=savedUser
            res.json({token:token,user:{_id,name,email}})
            }else{
                return res.status(422).json({error:"Invalid email or password"})
            }
           
        })
    }).catch(err=>{
        console.log(err)
    })

})

module.exports =router;