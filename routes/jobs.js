"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobFilterOrUpdateSchema = require("../schemas/jobFilterOrUpdate.json");



const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: Admin
 */

router.post("/", ensureIsAdmin, async function (req, res, next) {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
});

/** GET /  => ALL JOBS -- no auth required
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters from the query string:
 * - minEmployees
 * - maxEmployees
 * - name (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    console.log('in get route');
    const filters = req.query;
    console.log(filters);
    if (filters.salary !== undefined) {
        filters.salary = Number(filters.salary);
    };
    
    if (filters.equity !== undefined) {
        filters.equity = Number(filters.equity);
    };
    
    const validator = jsonschema.validate(filters, jobFilterOrUpdateSchema);
    if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
    };
    
    const jobs = await Job.findAll(filters);
    console.log('jobs is: ', jobs);
    return res.json({ jobs });
});

/** GET /[handle]  => ONE JOB -- no auth required
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

// router.get("/:handle", async function (req, res, next) {
//     const company = await Company.get(req.params.handle);
//     return res.json({ company });
// });

// //ALL EDITS/DELETES ARE ADMINS

// /** PATCH /[handle] { fld1, fld2, ... } => { company }
//  *
//  * Patches company data.
//  *
//  * fields can be: { name, description, numEmployees, logo_url }
//  *
//  * Returns { handle, name, description, numEmployees, logo_url }
//  *
//  * Authorization required: Admin
//  */

// router.patch("/:handle", ensureIsAdmin, async function (req, res, next) {
//     const validator = jsonschema.validate(req.body, companyUpdateSchema);
//     if (!validator.valid) {
//         const errs = validator.errors.map(e => e.stack);
//         throw new BadRequestError(errs);
//     }

//     const company = await Company.update(req.params.handle, req.body);
//     return res.json({ company });
// });

// /** DELETE /[handle]  =>  { deleted: handle }
//  *
//  * Authorization: admin
//  */

// router.delete("/:handle", ensureIsAdmin, async function (req, res, next) {
//     // console.log("input for delete",req.params.handle)
//     await Company.remove(req.params.handle);
//     return res.json({ deleted: req.params.handle });
// });


module.exports = router;
