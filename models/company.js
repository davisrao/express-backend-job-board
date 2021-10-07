"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    // console.log(handle, name, description, numEmployees, logoUrl);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);
    const result = await db.query(
      `INSERT INTO companies 
          (handle,
          name,
          description,
          num_employees,
          logo_url)
        VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies. (array of companies)
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(filters) {
    // take in the filters and convert to SQL like the partial update fxn
    // pass those in to query  with filter based on what those equal
    // create separate function call sqlForFiltering

    const { filterCols, values } = Company.sqlForFiltering(
      filters,
      {
        minEmployees: "num_employees",
        maxEmployees: "num_employees",
      });

    let companiesRes;
    if (filterCols === "") {
      const querySql = `SELECT handle,
                         name,
                         description,
                         num_employees AS "numEmployees",
                         logo_url AS "logoUrl"
                  FROM companies
                  ORDER BY name`
      companiesRes = await db.query(querySql)
    } else {
      const querySql =
        `SELECT handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"
        FROM companies
        WHERE ${filterCols}
        ORDER BY name`;
      // console.log('query is: ', querySql);
      // console.log('values are: ', values);
      companiesRes = await db.query(querySql, values);
    }
    return companiesRes.rows;
  }

  /** Accepts two objects: dataToFilter k/v pairs if data to filter on
   * jsToSql k/v pairs of converting JS to SQL syntax needed for query
   * Returns an object with filterCols and values. 
   * filterCols is a string of column names separated by AND. 
   * Values are the correspondingvalues upon which to filter.

   * EXAMPLE {name: 'C1', minEmployees: 0, maxEmployees: 2}
   *    RETURN: {filterCols: "name"=$1 AND "num_employees">=$2 AND "num_employees" <= $3,
   *             values: ['C1', 0, 2]} 
  */

  static sqlForFiltering(dataToFilter, jsToSql) {
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








  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name: 'new name', description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];
    console.log('company in remove fxn', company);
    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
