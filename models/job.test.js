"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** create */

// describe("create", function () {
//     const newJob = {
//         title: "newJob",
//         salary: 400000,
//         equity: 0.004,
//         company_handle: 'c1',
//     };

//     test("works", async function () {
//         let job = await Job.create(newJob);
//         // console.log('job is: ', job);
//         expect(job).toEqual(            
//             {
//             id: expect.any(Number),
//             title: 'newJob',
//             salary: 400000,
//             equity: '0.004',
//             company_handle: 'c1',
//         });

//         const result = await db.query(
//             `SELECT id, title, salary, equity, company_handle
//            FROM jobs
//            WHERE title = 'newJob'`);
//            console.log(result.rows);
//         expect(result.rows).toEqual([
//             {
//                 id: expect.any(Number),
//                 title: 'newJob',
//                 salary: 400000,
//                 equity: '0.004',
//                 company_handle: 'c1',
//             },
//         ]);
//     });
// });

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let filters = {};
        let jobs = await Job.findAll(filters);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'jobtitle',
                salary: 100000,
                equity: '0.001',
                company_handle: 'c1',
            },
            {
                id: expect.any(Number),
                title: 'jobtitle2',
                salary: 200000,
                equity: '0.002',
                company_handle: 'c2',
            },
            {
                id: expect.any(Number),
                title: 'jobtitle3',
                salary: 300000,
                equity: '0.003',
                company_handle: 'c3',
            },
        ]);
    });

    test("works: filters on name jobtitle3", async function () {
        let filters = { title: "jobtitle3" };
        let jobs = await Job.findAll(filters);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'jobtitle3',
                salary: 300000,
                equity: '0.003',
                company_handle: 'c3',
            },
        ]);
    });

    test("works: partial filters on jobtitle", async function () {
        let filters = { title: "jobtitle" };
        let jobs = await Job.findAll(filters);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'jobtitle',
                salary: 100000,
                equity: '0.001',
                company_handle: 'c1',
            },
            {
                id: expect.any(Number),
                title: 'jobtitle2',
                salary: 200000,
                equity: '0.002',
                company_handle: 'c2',
            },
            {
                id: expect.any(Number),
                title: 'jobtitle3',
                salary: 300000,
                equity: '0.003',
                company_handle: 'c3',
            },
        ]);
    });

    test("works: filters on minSalary = 300000, hasEquity = true", async function () {
        let filters = { minSalary: 300000, hasEquity: true };
        let jobs = await Job.findAll(filters);
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: 'jobtitle3',
                salary: 300000,
                equity: '0.003',
                company_handle: 'c3',
            },
        ]);
    });

    test("error: filter key non-existent", async function () {
        let filters = { nonExistent: 'error' };
        try {
            let jobs = await Job.findAll(filters);
        } catch (err) {
            // console.log('non-existent', err);
            expect(err.status).toEqual(400);
        };
    });
});

    // // /************************************** get */

    // describe("get", function () {
    //     test("works", async function () {
    //         let company = await Company.get("c1");
    //         expect(company).toEqual({
    //             handle: "c1",
    //             name: "C1",
    //             description: "Desc1",
    //             numEmployees: 1,
    //             logoUrl: "http://c1.img",
    //         });
    //     });

    //     test("not found if no such company", async function () {
    //         try {
    //             await Company.get("nope");
    //             fail();
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });
    // });

    // /************************************** update */

    // describe("update", function () {
    //     const updateData = {
    //         name: "New",
    //         description: "New Description",
    //         numEmployees: 10,
    //         logoUrl: "http://new.img",
    //     };

    //     test("works", async function () {
    //         let company = await Company.update("c1", updateData);
    //         expect(company).toEqual({
    //             handle: "c1",
    //             ...updateData,
    //         });

    //         const result = await db.query(
    //             `SELECT handle, name, description, num_employees, logo_url
    //            FROM companies
    //            WHERE handle = 'c1'`);
    //         expect(result.rows).toEqual([{
    //             handle: "c1",
    //             name: "New",
    //             description: "New Description",
    //             num_employees: 10,
    //             logo_url: "http://new.img",
    //         }]);
    //     });

    //     test("works: null fields", async function () {
    //         const updateDataSetNulls = {
    //             name: "New",
    //             description: "New Description",
    //             numEmployees: null,
    //             logoUrl: null,
    //         };

    //         let company = await Company.update("c1", updateDataSetNulls);
    //         expect(company).toEqual({
    //             handle: "c1",
    //             ...updateDataSetNulls,
    //         });

    //         const result = await db.query(
    //             `SELECT handle, name, description, num_employees, logo_url
    //            FROM companies
    //            WHERE handle = 'c1'`);
    //         expect(result.rows).toEqual([{
    //             handle: "c1",
    //             name: "New",
    //             description: "New Description",
    //             num_employees: null,
    //             logo_url: null,
    //         }]);
    //     });

    //     test("not found if no such company", async function () {
    //         try {
    //             await Company.update("nope", updateData);
    //             fail();
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });

    //     test("bad request with no data", async function () {
    //         try {
    //             await Company.update("c1", {});
    //             fail();
    //         } catch (err) {
    //             expect(err instanceof BadRequestError).toBeTruthy();
    //         }
    //     });
    // });

    // /************************************** remove */

    // describe("remove", function () {
    //     test("works", async function () {
    //         await Company.remove("c1");
    //         const res = await db.query(
    //             "SELECT handle FROM companies WHERE handle='c1'");
    //         expect(res.rows.length).toEqual(0);
    //     });

    //     test("not found if no such company", async function () {
    //         try {
    //             await Company.remove("nope");
    //             fail();
    //         } catch (err) {
    //             expect(err instanceof NotFoundError).toBeTruthy();
    //         }
    //     });
// });
