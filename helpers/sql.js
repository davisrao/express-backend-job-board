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
  console.log('cols are:', cols);
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

//** Accepts two objects: dataToFilter will contain key-value pairs
//  * of filtered data - name, minEmployees, and maxEmployees are only valid optiuons. 
// * EXAMPLE {name: 'C1', minEmployees: 0, maxEmployees: 2}
//  * jsToSql are key-value pairs of converting JS to SQL syntax needed for query
//  * Returns an object with filterCols and values. filterCols is a string
//  * of column names separated by AND. Values are the corresponding
//  * values upon which to filter.
// */

// 

function sqlForFiltering(dataToFilter, jsToSql) {
  const keys = Object.keys(dataToFilter);

  if (keys.length === 0){
    return {
        filterCols:"",
        values:[],
    };
  };

  if (dataToFilter.minEmployees > dataToFilter.maxEmployees){
    throw new BadRequestError("Min cannot be greater than max employees")
  }

  // need to return a big string for each piece
  // for each key, make a string that has the logical operator
  const operators = {
    name: "=",
    minEmployees: ">",
    maxEmployees: "<"
  };

  // gives back an array of sql for where statement name: a_name => ["name" = 'a_name']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"${operators[colName]}$${idx + 1}`,
  );
  console.log('cols are:', cols);
  return {
    filterCols: cols.join(" AND "),
    values: Object.values(dataToFilter),
  };
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
