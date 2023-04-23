const express=require('express')
const router=express.Router({mergeParams:true})//this parameter is specified for accessing the 'id' of blog (blog/:id),which otherwise req.params will not have access to. 
const Blog = require('../models/blog');
const Review = require('../models/comment');
const catchAsync = require('../utils/catchAsync');
const {validateReview,isLoggedIn,isCommentAuthor}=require('../middleware')


router.post('/',isLoggedIn,validateReview, catchAsync(async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author=req.user._id
    blog.reviews.push(review);
    await review.save();
    await blog.save();
    req.flash('success','Comment added')
    res.redirect(`/blogs/${blog._id}`);
}))

router.delete('/:c_id',isLoggedIn,isCommentAuthor, catchAsync(async (req, res) => {
    
    const { id, c_id } = req.params;
    await Blog.findByIdAndUpdate(id, { $pull: { reviews: c_id } });//pull operator removes from an existing array of a value that matches a specified condition, in this delete all the id's that are in the blog.
    await Review.findByIdAndDelete(c_id);
    req.flash('success','Successfully deleted the comment')
    res.redirect(`/blogs/${id}`);
    
}))

module.exports=router