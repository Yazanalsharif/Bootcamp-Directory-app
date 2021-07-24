const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv');
//dotenv the path from the root of the folder
dotenv.config({ path: './config/config.env' });
//create option include the provider of the geocode and the apiKey
const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};
//acknowledge the NodeGeocoder the options that i want to use
const geocoder = NodeGeocoder(options);

module.exports = geocoder;
