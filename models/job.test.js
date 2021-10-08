"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    idResults,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
/************************************** create */

describe("create", function () {
    const newJob = {
        title: "newJob",
        salary: 400000,
        equity: 0.004,
        company_handle: 'c1',
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        // console.log('job is: ', job);
        expect(job).toEqual(            
            {
            id: expect.any(Number),
            title: 'newJob',
            salary: 400000,
            equity: '0.004',
            company_handle: 'c1',
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'newJob'`);
        expect(result.rows).toEqual([
            {
                id: expect.any(Number),
                title: 'newJob',
                salary: 400000,
                equity: '0.004',
                company_handle: 'c1',
            },
        ]);
    });
});

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

describe("get", function () {
    test("works", async function (){
        // console.log("job id1", jobId1);
        let job = await Job.get(idResults[0].id);
        expect(job).toEqual({
            id: idResults[0].id,
            title: 'jobtitle',
            salary: 100000,
            equity: '0.001',
            company_handle: 'c1',
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(100000000);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

    // /************************************** update */

    describe("update", function () {
        const updateData = {
            title: "New",
            salary: 100000,
            equity: 0.10,
        };

        test("works", async function () {
            let job = await Job.update(idResults[0].id, updateData);
            expect(job).toEqual({
                id: idResults[0].id,
                title: 'New',
                salary: 100000,
                equity: '0.1',
                company_handle: 'c1',
            });

            const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
               FROM jobs
               WHERE id = $1`,[idResults[0].id]);
            expect(result.rows).toEqual([{
                id: idResults[0].id,
                title: 'New',
                salary: 100000,
                equity: '0.1',
                company_handle: 'c1',
            }]);
        });

        test("works: null fields", async function () {
            const updateDataSetNulls = {
                title: "New",
                salary: null,
                equity: null,
            };

            let job = await Job.update(idResults[0].id, updateDataSetNulls);
            expect(job).toEqual({
                id: idResults[0].id,
                title: "New",
                salary: null,
                equity: null,
                company_handle: 'c1',
            });

            const result = await db.query(
                `SELECT id, title, salary, equity, company_handle
                FROM jobs
                WHERE id = $1`,[idResults[0].id]);
            expect(result.rows).toEqual([{
                id: idResults[0].id,
                title: "New",
                salary: null,
                equity: null,
                company_handle: 'c1',
            }]);
        });

        test("not found if no such job", async function () {
            try {
                await Job.update(10000, updateData);
                fail();
            } catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });

        test("bad request with no data", async function () {
            try {
                await Job.update(idResults[0].id, {});
                fail();
            } catch (err) {
                expect(err instanceof BadRequestError).toBeTruthy();
            }
        });
    });

    /************************************** remove */

    describe("remove", function () {
        test("works", async function () {
            await Job.remove(idResults[0].id);
            const res = await db.query(
                "SELECT id FROM jobs WHERE id=$1",[idResults[0].id]);
            expect(res.rows.length).toEqual(0);
        });

        test("not found if no such company", async function () {
            try {
                await Job.remove(10000);
                fail();
            } catch (err) {
                expect(err instanceof NotFoundError).toBeTruthy();
            }
        });
});
