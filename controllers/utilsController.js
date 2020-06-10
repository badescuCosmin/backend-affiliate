exports.paginatedResults = (req, res, next) => {
  const page = parseInt(req.params.page);
  const itemsToPass = parseInt(req.params.page) * parseInt(req.params.limit);
  const endArray = (parseInt(req.params.page) + 1) * parseInt(req.params.limit);
  const limit = parseInt(req.params.limit);
  const totalNrPages = Math.ceil(parseInt(req.data.results) / limit);
  req.data.totalNrPages = totalNrPages;
  if (page + 1 < totalNrPages) {
    req.data.next = {
      page: page + 1,
      limit: limit
    }
  }

  if (page > 0) {
    req.data.previous = {
      page: page - 1,
      limit: limit
    }
  }
  req.data.data.rows = req.data.data.rows.slice(itemsToPass, endArray);
  next();
}

exports.filterCategories = (req, res, next) => {
  
  const filteredData = [];

  req.data.data.rows.forEach(el => {
    let found = false;
    for (let i = 0; i < filteredData.length; i++) {
      if (filteredData[i].category_name === el.category_name) {
        found = true;
        filteredData[i].subcategory_name = filteredData[i].subcategory_name + ' ' + el.subcategory_name;
      }
    }
    if (!found) {
      filteredData.push(el)
    }
  });
  filteredData.forEach(element =>{
    element.subcategory_name  = element.subcategory_name.split(' ')
  })
  req.data = filteredData;
  next();
}