const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocode');
//bootcamp schema
const BootCampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'the name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'The maximum length is 50 character'],
      minlength: [5, `the min length is 5 character`],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'the description is required'],
      maxlength: [500, 'Description must be not greate than 500'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'the url is not valid',
      ],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'the email is not valid',
      ],
    },
    phoneNumber: {
      type: String,
      maxlength: [20, 'the phone number is not valied'],
    },
    address: {
      type: String,
      required: [true, 'the address is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere', // i don't know any thing about
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other',
      ],
    },
    avarageRating: {
      type: Number,
      min: [1, 'the minmum rating is 1'],
      max: [10, 'the maximum rating is 10'],
    },
    avarageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    housing: {
      type: Boolean,
      default: false,
    },
    jobAssistance: {
      type: Boolean,
      default: false,
    },
    jobGuarantee: {
      type: Boolean,
      default: false,
    },
    acceptGi: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    avgCost: {
      type: Number,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
BootCampSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

BootCampSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].countryCode,
    zipcode: loc[0].zipcode,
    country: loc[0].country,
  };
  this.address = undefined;
  next();
});
//reverse populate so can get data of courses from bootcamp data
//@desc            courses is the name of properity will exist in bootcamp object
BootCampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp',
  justOne: false,
});

BootCampSchema.pre('remove', async function (next) {
  console.log(`the bootcamp is deleted with all courses`);
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next();
});

module.exports = mongoose.model('Bootcamp', BootCampSchema);
