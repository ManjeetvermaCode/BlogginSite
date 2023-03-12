const Joi = require('joi');

module.exports.blogschema = Joi.object({
    blog: Joi.object({
        title: Joi.string().required(),
        image: Joi.string().required(),
        body: Joi.string().required()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required()
    }).required()
})

