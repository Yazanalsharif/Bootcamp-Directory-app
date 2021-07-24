const Mongoose = require('mongoose');

const ReviewSchema = new Mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'please fill the title of the Review'],
    maxlength: 100,
  },
  text: {
    type: String,
    trim: true,
    minlength: 3,
    required: [true, 'please fill the description about the review'],
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    required: true,
  },
  bootcamp: {
    type: Mongoose.Schema.ObjectId,
    required: true,
    ref: 'Bootcamp',
  },
  user: {
    type: Mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
});
// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

// aggreation the rate of the bootcamp will be here
ReviewSchema.statics.calcAvgRating = async function (bootcampId) {
  //calculate the avg of rating to all reviews to the same bootcamp
  /*const avgRating = await this.aggregate([
    { $match: { bootcmap: bootcampId } },
    { $group: { _id: '$bootcamp' }, total: { $avg: '$rating' } },
  ]);*/

  const avgRating = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    { $group: { _id: '$bootcampId', avgRate: { $avg: '$rating' } } },
  ]);

  //update the avgRating on the bootcamp
  try {
    //bring the bootcamp model to update the document
    const Bootcamp = this.model('Bootcamp');
    //update the documents
    await Bootcamp.findByIdAndUpdate(bootcampId, {
      avarageRating: avgRating[0].avgRate,
    });
  } catch (error) {
    console.error(error);
  }
};

ReviewSchema.post('save', async function (next) {
  //call the function after saving the document
  this.constructor.calcAvgRating(this.bootcamp);
});

ReviewSchema.pre('remove', async function (next) {
  //call the function before deleting the document
  this.constructor.calcAvgRating(this.bootcamp);
});

module.exports = Mongoose.model('Review', ReviewSchema);
