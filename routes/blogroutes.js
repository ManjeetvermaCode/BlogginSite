const express=require('express')
const router=express.Router()
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { blogschema } = require('../schemas.js');
const Campground = require('../models/campground');


const validateblog = (req, res, next) => {
    const { error } = blogschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const blog = await Campground.find({});
   res.render('campgrounds/index', { blog })
   //res.send('working')
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})


router.post('/', validateblog, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const blog = new Campground(req.body.blog);
    await blog.save();
    res.redirect(`/blogs/${blog._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const blog = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { blog,});
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const blog = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { blog });
}))

router.put('/:id', validateblog, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Campground.findByIdAndUpdate(id, { ...req.body.blog });
    res.redirect(`/blogs/${blog._id}`)
}));



router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);//this will trigger the findOneandDelete() middleware in the campground model.
    res.redirect('/blogs');
}));
module.exports=router;