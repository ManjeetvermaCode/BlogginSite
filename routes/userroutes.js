const express=require('express')
const router=express.Router({mergeParams:true})
const catchAsync=require('../utils/catchAsync')
const user=require('../models/user')
const passport = require('passport')

router.get('/register',(req,res)=>{
    res.render('users/registerform')//rendering register form 
})

router.post('/register',catchAsync(async(req,res)=>{
    try{
        const {username,email,password}=req.body
        const newuser=new user({email,username})
        const registereduser=await user.register(newuser,password)
        console.log(registereduser)
        req.flash('success','Successfully registered!')
        res.redirect('/blogs')
    }catch(e){
        req.flash('error','e.message')
        res.redirect('/register')
    }
    
}))

router.get('/login',(req,res)=>{
    res.render('users/loginform')
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','You loggedin successfully')
    res.redirect('/blogs')
})

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', "Goodbye!");
      return res.redirect('/blogs');
    });
  });

module.exports=router