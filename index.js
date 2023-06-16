if(process.env.NODE_ENV !=='production'){
    require('dotenv').config()
}
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session=require('express-session')
const flash=require('connect-flash')
const helmet=require('helmet')

const blogroutes=require('./routes/blogroutes')
const reviewroutes=require('./routes/commentroutes');
const userroutes=require('./routes/userroutes');
const passport=require('passport')//allow us to implement multiple stratergy for authenticaiton
const localstratergy=require('passport-local')

//security packages
const mongoSanitize = require('express-mongo-sanitize');


const user=require('./models/user')
const dbUrl=process.env.db_url
//'mongodb://localhost:27017/yelp-camp'
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


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'))//used for serving public assests like images or css,js files.


app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy:false}))


const sessionconfig={
    name:'session',
    secret:'thisisasecretig',
    resave:true,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionconfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())//using for persistent user login, other wise a user will have to login on every request
passport.use(new localstratergy(user.authenticate()))//authenticate function is provided by passwordlocalmongoose from userSchema. We are using local stratergy

passport.serializeUser(user.serializeUser())//serialization is basically means how do we store a user in the session
passport.deserializeUser(user.deserializeUser())//and vice versa. Both functions are provided by passport-local-mongoose

app.use((req,res,next)=>{//declaring middleware for flash
    res.locals.success=req.flash('success')//storing key of success under res.locals.success, so that we can use it in ejs files.
    res.locals.error=req.flash('error')
    res.locals.currentuser=req.user
    next()
})

app.use('/',userroutes)
app.use('/blogs',blogroutes)
app.use('/blogs/:id/comments',reviewroutes)


app.get('/', (req, res) => {
    res.render('home')//home route of blogs
});


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