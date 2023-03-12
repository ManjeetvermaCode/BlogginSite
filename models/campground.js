const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: String,
    image: String,
    body: String,
    
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

BlogSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
})

module.exports = mongoose.model('Campground', BlogSchema);