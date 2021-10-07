"use strict";

const { query } = require("express");
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * */

  static async create({ title, salary, equity, company_handle }) {

    const result = await db.query(
      `INSERT INTO jobs 
            (title, salary, equity, company_handle)
          VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle`,
      [title, salary, equity, company_handle],
    );
    let job = result.rows[0];
    //job.equity = Number(job.equity);
    console.log('IN CREATE FUNCTION: ', job);
    return job;
  }

  /** Find all jobs. (array of jobs)
   *
   * Returns [{ id, title, salary, equity, company_handle }, ...]
   * */

  static async findAll(filters) {
    // take in the filters and convert to SQL like the partial update fxn
    // pass those in to query  with filter based on what those equal
    // create separate function call sqlForFiltering

    const { filterCols, values } = Job.sqlForFiltering(
      filters,
      {
        minSalary: "salary",
        hasEquity: "equity",
      });

    let jobsResp;
    let whereClause;

    if (filterCols === "") {
      whereClause = "";
    } else {
      whereClause = `WHERE ${filterCols}`;
    }
    const querySql = `SELECT 
                          id,
                          title,
                          salary, 
                          equity, 
                          company_handle
                        FROM jobs
                          ${whereClause}
                          ORDER BY id`
    jobsResp = await db.query(querySql, values);
    return jobsResp.rows;
  }

  /** Accepts two objects: dataToFilter k/v pairs if data to filter on
   * jsToSql k/v pairs of converting JS to SQL syntax needed for query
   * Returns an object with filterCols and values. 
   * filterCols is a string of column names separated by AND. 
   * Values are the correspondingvalues upon which to filter.
 
   * EXAMPLE {title: 'jobtitle', minSalary: 10000, hasEquity: true}
   *    RETURN: {filterCols: "title" ILIKE $1 AND "minSalary">=$2 AND "hasEquity" > 0,
   *             values: ['%jobtitle%', 10000, 0]} 
  */

  static sqlForFiltering(dataToFilter, jsToSql) {
  //if key is name, add % to value
  const keys = Object.keys(dataToFilter);
  if (dataToFilter.title !== undefined) {
    dataToFilter.title = `%${dataToFilter.title}%`;
  }

  if (dataToFilter.hasEquity === false || dataToFilter.hasEquity === undefined) {
    delete dataToFilter.hasEquity;
  } else {
    dataToFilter.hasEquity = 0;
  }

  const operators = {
    title: " ILIKE ",
    minSalary: ">=",
    hasEquity: ">" //??
  };

  if (keys.length === 0) {
    return {
      filterCols: "",
      values: [],
    };
  };

  // gives back an array of sql for where statement name: a_name => ["name" = 'a_name']
  const cols = keys.map(function (colName, idx) {
    //if invalid filtering parameters, throw error
    if (operators[colName] === undefined) {
      throw new BadRequestError("Filtering parameters not accepted")
    }

    return `"${jsToSql[colName] || colName}"${operators[colName]}$${idx + 1}` //update when called
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


module.exports = Job;
