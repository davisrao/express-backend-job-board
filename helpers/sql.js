const { BadRequestError } = require("../expressError");

//** Accepts two objects, dataToUpdate will contain key-value pairs
//  * of what needs to be updated in the database. jsToSql are key-value
//  * pairs of converting JS to SQL syntax for numEmployees & logoUrl.
//  * Returns an object with setCols and values. setCols is a string
//  * of column names separated by commas. Values are the corresponding
//  * values to update.
// */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

//** Accepts two objects: dataToFilter will contain key-value pairs
//  * of filtered data - name, minEmployees, and maxEmployees are only valid optiuons. 
//  * jsToSql are key-value pairs of converting JS to SQL syntax needed for query
//  * Returns an object with filterCols and values. filterCols is a string
//  * of column names separated by AND. Values are the corresponding
//  * values upon which to filter.
//  * If dataToFilter is empty, return an empty string for filterCols & empty array for values.
//  * If minEmployees > maxEmployees, throw an error.
//  * If filtering keys are not name/minEmp/maxEmp, throw an error.
//  * EXAMPLE {name: 'C1', minEmployees: 0, maxEmployees: 2}
//  *    RETURN: {filterCols: "name"=$1 AND "num_employees">=$2 AND "num_employees" <= $3,
//  *             values: ['C1', 0, 2]} 
// */

function sqlForFiltering(dataToFilter, jsToSql) {
  //if key is name, add % to value
  const keys = Object.keys(dataToFilter);
  if (dataToFilter.name !== undefined) {
    dataToFilter.name = `%${dataToFilter.name}%`;
  }

  const operators = {
    name: " ILIKE ",
    minEmployees: ">=",
    maxEmployees: "<="
  };


  if (keys.length === 0) {
    return {
      filterCols: "",
      values: [],
    };
  };

  if (dataToFilter.minEmployees > dataToFilter.maxEmployees) {
    throw new BadRequestError("Min cannot be greater than max employees")
  }

  // need to return a big string for each piece
  // for each key, make a string that has the logical operator

  // gives back an array of sql for where statement name: a_name => ["name" = 'a_name']
  const cols = keys.map(function (colName, idx) {
    //if invalid filtering parameters, throw error
    if (operators[colName] === undefined) {
      throw new BadRequestError("Filtering parameters not accepted")
    }

    return `"${jsToSql[colName] || colName}"${operators[colName]}$${idx + 1}`
  });

  return {
    filterCols: cols.join(" AND "),
    values: Object.values(dataToFilter),
  };
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
