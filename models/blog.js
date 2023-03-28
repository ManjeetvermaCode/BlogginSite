const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const User=require('../models/user')
const BlogSchema = new Schema({
    title: String,
    image: String,
    body: String,
    description:String,
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

BlogSchema.post('findOneAndDelete', async function (doc) {//doc is the object that has deleted
  
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews//here wi'll delete all comments whose id field is in the object(doc) that has deleted
            }
        })
    }
    
})

module.exports = mongoose.model('Campground', BlogSchema);