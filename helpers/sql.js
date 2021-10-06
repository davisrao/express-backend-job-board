const { BadRequestError } = require("../expressError");

/** Accepts two objects, dataToUpdate will contain k/v pairs of what to update. 
 * jsToSql are key-value pairs of converting JS to SQL syntax for numEmployees & logoUrl.
 * Returns an object with setCols and values. setCols is a string
 * of column names separated by commas. Values are the corresponding
 * values to update.
 * 
 *    * EXAMPLE {name: 'newName', numEmployees: 324}
   *    RETURN: {setCols: "name"=$1 , "num_employees"=$2,
   *             values: ['newName', 324]} 
*/
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


module.exports = { sqlForPartialUpdate};
