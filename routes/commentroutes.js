const express=require('express')
const router=express.Router({mergeParams:true})//this parameter is specified for accessing the 'id' of blog (blog/:id),which otherwise req.params will not have access to. 
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas.js');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/',validateReview, catchAsync(async (req, res) => {
    const Blog = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    Blog.reviews.push(review);
    await review.save();
    await Blog.save();
    req.flash('success','Comment added')
    res.redirect(`/blogs/${Blog._id}`);
}))

router.delete('/:c_id', catchAsync(async (req, res) => {
    
    const { id, c_id } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: c_id } });//pull operator removes from an existing array of a value that matches a specified condition, in this delete all the id's that are in the blog.
    await Review.findByIdAndDelete(c_id);
    req.flash('success','Successfully deleted the comment')
    res.redirect(`/blogs/${id}`);
    
}))

module.exports=router