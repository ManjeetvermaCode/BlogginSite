const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { blogschema,reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateblog = (req, res, next) => {
    const { error } = blogschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

//start of blog routes
app.get('/', (req, res) => {
    res.render('home')
});
app.get('/blogs', catchAsync(async (req, res) => {
    const blog = await Campground.find({});
   res.render('campgrounds/index', { blog })
   //res.send('working')
}));

app.get('/blogs/new', (req, res) => {
    res.render('campgrounds/new');
})


app.post('/blogs', validateblog, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const blog = new Campground(req.body.blog);
    await blog.save();
    res.redirect(`/blogs/${blog._id}`)
}))

app.get('/blogs/:id', catchAsync(async (req, res,) => {
    const blog = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { blog });
}));

app.get('/blogs/:id/edit', catchAsync(async (req, res) => {
    const blog = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { blog });
}))

app.put('/blogs/:id', validateblog, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blog = await Campground.findByIdAndUpdate(id, { ...req.body.blog });
    res.redirect(`/blogs/${blog._id}`)
}));



app.delete('/blogs/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);//this will trigger the findOneandDelete() middleware in the campground model.
    res.redirect('/blogs');
}));

//start of comments routes

app.post('/blogs/:id/comments',validateReview, catchAsync(async (req, res) => {
    const Blog = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    Blog.reviews.push(review);
    await review.save();
    await Blog.save();
    res.redirect(`/blogs/${Blog._id}`);
}))

app.delete('/blogs/:id/comments/:c_id', catchAsync(async (req, res) => {
    
    const { id, c_id } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: c_id } });//pull operator removes from an existing array of a value that matches a specified condition, in this delete all the id's that are in the blog.
    await Review.findByIdAndDelete(c_id);
    res.redirect(`/blogs/${id}`);
    
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})


//here if we'll delete a blog its associated comments will not get delete from database.that's why we need campground deletion middleware that will delete all associated comments when blog will get delete.