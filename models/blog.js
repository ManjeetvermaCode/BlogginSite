const { string } = require('joi');
const mongoose = require('mongoose');
const Review = require('./comment')
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    image: String,
    body: String,
    description:String,
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