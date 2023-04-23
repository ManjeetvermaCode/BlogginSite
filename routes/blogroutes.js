const express=require('express')
const router=express.Router()
const catchAsync = require('../utils/catchAsync');

const Blog = require('../models/blog');
const {isLoggedIn,validateblog,isAuthor}=require('../middleware');



router.get('/', catchAsync(async (req, res) => {
    const blog = await Blog.find({});
    
   res.render('campgrounds/index', { blog })
   //res.send('working')
}));

router.get('/new',isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})


router.post('/', validateblog,isLoggedIn,catchAsync(async (req, res) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const blog = new Blog(req.body.blog);
    blog.author=req.user._id
    //console.log(blog)
    await blog.save();
    req.flash('success','campground created successfully')
    res.redirect(`/blogs/${blog._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const blog = await Blog.findById(req.params.id).populate({ path:'reviews',populate:{path:'author'}}).populate('author');//this is saying populate the reviews and then populate it's associated author, then finally populate the author(blog).
    if(!blog){
        req.flash('error','Blog not found')
        return res.redirect('/blogs')
      }
    res.render('campgrounds/show', { blog,});
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id)
    if(!blog){
         req.flash('error','Blog not found')
         return res.redirect('/blogs')

      }
    res.render('campgrounds/edit', { blog });
}))

router.put('/:id',isLoggedIn, validateblog,isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findByIdAndUpdate(id, { ...req.body.blog });
    req.flash('success','Successfully Updated the Blog')
    res.redirect(`/blogs/${blog._id}`)
}));



router.delete('/:id',isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);//this will trigger the findOneandDelete() middleware in the blog model.
    req.flash('success','Successfully deleted the blog')
    res.redirect('/blogs');
}));
module.exports=router;