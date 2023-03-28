const express=require('express')
const router=express.Router()
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { blogschema } = require('../schemas.js');
const Campground = require('../models/blog');
const {isLoggedIn}=require('../middleware');


const validateblog = (req, res, next) => {
    const { error } = blogschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const blog=await Campground.findById(id)
    if(blog.author!==req.user._id){
        req.flash('error','You do not have the permission')
        return res.redirect(`/blogs/${blog._id}`)
    }
    next()
}

router.get('/', catchAsync(async (req, res) => {
    const blog = await Campground.find({});
    
   res.render('campgrounds/index', { blog })
   //res.send('working')
}));

router.get('/new',isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})


router.post('/', validateblog,isLoggedIn,isAuthor, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const blog = new Campground(req.body.blog);
    blog.author=req.user._id
    //console.log(blog)
    await blog.save();
    req.flash('success','campground created successfully')
    res.redirect(`/blogs/${blog._id}`)
}))

router.get('/:id',isLoggedIn, catchAsync(async (req, res,) => {
    const blog = await Campground.findById(req.params.id).populate('reviews').populate('author');//(people on discord)having trouble here
    if(!blog){
        req.flash('error','Blog not found')
        return res.redirect('/blogs')
      }
    res.render('campgrounds/show', { blog,});
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const blog = await Campground.findById(req.params.id)
    if(!blog){
         req.flash('error','Blog not found')
         return res.redirect('/blogs')

      }
    res.render('campgrounds/edit', { blog });
}))

router.put('/:id',isLoggedIn, validateblog,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Campground.findByIdAndUpdate(id, { ...req.body.blog });
    req.flash('success','Successfully Updated the Blog')
    res.redirect(`/blogs/${blog._id}`)
}));



router.delete('/:id',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);//this will trigger the findOneandDelete() middleware in the campground model.
    req.flash('success','Successfully deleted the blog')
    res.redirect('/blogs');
}));
module.exports=router;