//fetch bootcamp model from models file to work with databases
const Bootcamp = require('../models/bootcamps');
const ErrorHandler = require('../utils/errorResponse');
const geocoder = require('../utils/geocode');
const multer = require('multer');
const errorHandler = require('../middlewares/error');

//@desc               Get All bootcamps
//@route              GET /api/bootcamps
//@access             puplic
const getBootcamps = async (req, res) => {
  try {
    //nothing here accept responce  all handling in the middle ware becouse i need to make a good filtering middle ware.
    res.status(200).json(res.advanceResult);
  } catch (error) {
    res.status(500).json({ success: false, msg: error.message });
  }
};

//@desc               Get specific bootcamp
//@route              GET /api/bootcamps/:id
//@access             puplic
const getBootcamp = async (req, res, next) => {
  const _id = req.params.id;
  try {
    const bootcamps = await Bootcamp.findById(_id);

    if (!bootcamps) {
      return next(new ErrorHandler(`bootcamp is not found by id ${_id}`, 404));
    }

    res.status(200).json({ success: true, data: bootcamps });
  } catch (err) {
    // res.status(400).json({ success: false, msg: err.message });
    next(err);
  }
};

//@desc               Create new bootcamp
//@route              Post /api/bootcamps/
//@access             private
const createBootcamp = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    //the user must be admin to create alot of bootcamps ,publisher could create 1 bootcamp and user could not
    const publishedBootcamp = await Bootcamp.findOne({
      user: req.body.user
    });
    //if this user is publisher and belong him bootcamp he could't make another one
    if (publishedBootcamp && req.user.role !== 'admin') {
      return next(new ErrorHandler('The user already has the bootcamp', 400));
    }

    //add the bootcamp to the database
    const bootcamp = await Bootcamp.create(req.body);
    //response to the client side
    res.status(201).json({ success: true, bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc               update exist bootcamp
//@route              PUT /api/bootcamps/:id
//@access             private
const updateBootcamp = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorHandler(`bootcamp is not found by id ${req.params.id}`, 404)
      );
    }
    //checking if the use is the owner of the bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorHandler('only the owner of the bootcamp can Edit it', 403)
      );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: bootcamp
    });
  } catch (error) {
    next(err);
  }
};

//@desc               delete exist bootcamp
//@route              DELETE /api/bootcamps/:id
//@access             private
const deleteBootcamp = async (req, res, next) => {
  try {
    const _id = req.params.id;
    const bootcamp = await Bootcamp.findById(_id);

    if (!bootcamp) {
      return next(new ErrorHandler(`bootcamp is not found by id ${_id}`, 404));
    }

    //checking if the use is the owner of the bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorHandler('only the owner of the bootcamp can Delete it', 403)
      );
    }

    bootcamp.remove();
    res.status(200).json({ success: true, msg: bootcamp });
  } catch (error) {
    next(error);
  }
};

//@desc               get bootcamp by radius and distance
//@route              get /api/bootcamps/:zipcode/:distance
//@access             private
const getBootcampWithinRadius = async (req, res, next) => {
  try {
    const { zipcode, distance } = req.params;
    //get lat, long from locaiton
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lon = loc[0].longitude;
    console.log(loc);
    //calc radius using radians
    //divide dis on the radius of Earth
    //radius of Earth 3,963 mi
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
      location: {
        $geoWithin: { $centerSphere: [[lon, lat], radius] }
      }
    });
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  } catch (err) {
    next(err);
  }
};
//@desc               upload bootcamp avater
//@route              PUT /api/bootcamps/upload/:id
//@access             private
const uploadBootcampAvater = async (req, res, next) => {
  try {
    let bootcamp = await Bootcamp.findById(req.params.id);
    //if the bootcamp not exist in database
    if (!bootcamp) {
      return next(new ErrorHandler('the bootcamp not exist', 404));
    }

    //if no file uploaded then =>
    if (!req.file) {
      return next(new ErrorHandler('please provide the image file', 400));
    }

    //checking if the use is the owner of the bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorHandler('only the owner of the bootcamp can update it', 403)
      );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      {
        photo: req.file.filename
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      msg: 'the image uploaded successfully',
      data: bootcamp
    });
  } catch (err) {
    if (err instanceof multer.MulterError) {
      //a multer error occurred when uploading
      next(new ErrorHandler(err, 500));
    } else {
      //another error happened
      next(new ErrorHandler('Server Error', 500));
    }
  }
};

module.exports = {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithinRadius,
  uploadBootcampAvater
};
