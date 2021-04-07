const advanceResult = (model, populate) => async (req, res, next) => {
  //clone query string to anothre object
  const queryStringClone = { ...req.query };
  //test the courses routes

  //remove fields becouse it does't must match with decouments
  const removeFields = ['select', 'sort', 'limit', 'page'];
  console.log(queryStringClone);
  //loops for remove the fields
  removeFields.forEach((param) => {
    delete queryStringClone[param];
  });
  console.log(queryStringClone);
  //stringify the json to string to make some edits
  let queryStr = JSON.stringify(queryStringClone);

  //make the query string work as query operators
  queryStr = queryStr.replace(
    /\b(gte|gt|lte|lt|in|ne)\b/g,
    (match) => `$${match}`
  );

  //query to get model
  let query = model.find(JSON.parse(queryStr));

  if (req.query.select) {
    let selectData = req.query.select.split(',').join(' ');
    query.select(selectData);
  }

  if (req.query.sort) {
    let sortingData = req.query.sort.split(',').join(' ');
    query.sort(sortingData);
  } else {
    query.sort('-createdAt');
  }

  //skip the document and limit the data came (pagination)
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  //the documents will begin from startIndex
  const startIndex = (page - 1) * limit;
  //end of index documents
  const endIndex = startIndex + limit;
  //number of all documents in database
  const docuCount = await model.countDocuments();

  query.skip(startIndex).limit(limit);

  if (populate) {
    query.populate(populate);
  }

  //get data using query
  const results = await query;

  //create paginaiton object to display
  const pagination = {};

  //handle local page
  pagination.localPage = page;

  //handle previous pages
  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit
    };
  }
  //handle next pages
  if (endIndex < docuCount) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  res.advanceResult = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advanceResult;
