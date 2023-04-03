const Joi = require('joi');

module.exports.blogschema = Joi.object({
    blog: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().required(),
        body: Joi.string().required(),
        description:Joi.string().required()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required()
    }).required()
})

module.exports.pwSchema=Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).+$/).required() // at least one lowercase letter, one uppercase letter, one digit, and one special character

