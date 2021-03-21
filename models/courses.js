const mongoose = require('mongoose');

//create course schema
const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'the title is required']
  },
  description: {
    type: String,
    required: [true, 'the describtion is required']
  },
  weeks: {
    type: Number,
    required: [true, 'the weeks of the course is required']
  },
  tuition: {
    type: Number,
    required: [true, 'please add a titution cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'the minmumSkill is required'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  scholarhipsAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
});

CourseSchema.statics.calculateAvgCost = async function (bootcampId) {
  //this referr to course model
  const agg = await this.aggregate([
    { $match: { bootcamp: bootcampId } },
    {
      $group: {
        _id: '$bootcamp',
        avgCost: { $avg: '$tuition' }
      }
    }
  ]);

  try {
    //update the bootcamp document and add avg cost of courses
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
      avgCost: (Math.ceil(agg[0].avgCost) / 10) * 10
    });
  } catch (err) {
    console.error(err);
  }
};

//to calculate the avgCost to bootcamp after saving the course
CourseSchema.post('save', async function (next) {
  //this referr to the document you want to save
  this.constructor.calculateAvgCost(this.bootcamp);
});

//to calculate the avgCost to bootcamp before removing the course
CourseSchema.pre('remove', async function (next) {
  //this referr to the document you want to remove
  this.constructor.calculateAvgCost(this.bootcamp);
});
module.exports = mongoose.model('Course', CourseSchema);
