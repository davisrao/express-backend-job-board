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

module.exports = { sqlForPartialUpdate };
