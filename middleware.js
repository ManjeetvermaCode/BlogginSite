const ExpressError = require('./utils/ExpressError');
const { blogschema } = require('./schemas.js');
const Campground = require('./models/blog');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){//this method is provided by passport
        req.session.returnTo=req.originalUrl;//will store if unloggedin user try to access secure features.
        req.flash('error','You must signed in!!!')
       return res.redirect('/login')//return is needed other wise we'll get error ( Cannot set headers after they are sent to the client)
    }//if user is not registered next block of code will also get executed.
    next();
}

module.exports.validateblog = (req, res, next) => {
    const { error } = blogschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor=async(req,res,next)=>{
    const {id}=req.params
    const blog=await Campground.findById(id)
    if(blog.author!==req.user._id){
        req.flash('error','You do not have the permission')
        return res.redirect(`/blogs/${blog._id}`)
    }
    next()
}