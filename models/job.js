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


  /** Given a job id return data on job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {

    const jobRes = await db.query(
                        `SELECT 
                          id,
                          title,
                          salary, 
                          equity, 
                          company_handle
                        FROM jobs
                        WHERE id = $1
                        ORDER BY id`,
      [id]);

    const job = jobRes.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
  *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title: 'new title', salary, equity}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {

    const { setCols, values } = sqlForPartialUpdate(data,{});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
          WHERE id = ${idVarIdx}
          RETURNING id, title, salary, equity, company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(id) {
    const result = await db.query(
      `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
      [id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}


module.exports = Job;
