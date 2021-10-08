"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  admin1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: 'newJob',
    salary: 400000,
    equity: 0.004,
    company_handle: 'c1',
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'newJob',
        salary: 400000,
        equity: '0.004',
        company_handle: 'c1',
    },
    });
  });

  test("not ok for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 10,
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${admin1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
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
        ],
    });
  });

  ////////////////////////////// CONTINUE HERE /////////////////////////////////
//   test("ok for anon - filters in query string", async function () {
//     const resp = await request(app).get("/jobs?name=C2&minEmployees=2");
//     expect(resp.body).toEqual({
//       jobs:
//         [
//           {
//             handle: "c2",
//             name: "C2",
//             description: "Desc2",
//             numEmployees: 2,
//             logoUrl: "http://c2.img",
//           }
//         ],
//     });
//   });

//   test("ok for anon - error: invalid filters in query string", async function () {
//     const resp = await request(app).get("/jobs?handle=c2");
//     expect(resp.status).toEqual(400);
//   });

//   test("fails: test next() handler", async function () {
//     // there's no normal failure event which will cause this route to fail ---
//     // thus making it hard to test that the error-handler works with it. This
//     // should cause an error, all right :)
//     await db.query("DROP TABLE jobs CASCADE");
//     const resp = await request(app)
//       .get("/jobs")
//       .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(500);
//   });
// });

// /************************************** GET /jobs/:handle */

// describe("GET /jobs/:handle", function () {
//   test("works for anon", async function () {
//     const resp = await request(app).get(`/jobs/c1`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("works for anon: company w/o jobs", async function () {
//     const resp = await request(app).get(`/jobs/c2`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c2",
//         name: "C2",
//         description: "Desc2",
//         numEmployees: 2,
//         logoUrl: "http://c2.img",
//       },
//     });
//   });

//   test("not found for non existent company", async function () {
//     const resp = await request(app).get(`/jobs/nope`);
//     expect(resp.statusCode).toEqual(404);
//   });
});

// /************************************** PATCH /jobs/:handle */

// describe("PATCH /jobs/:handle", function () {
//   test("works for admin", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.body).toEqual({
//       company: {
//         handle: "c1",
//         name: "C1-new",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//       },
//     });
//   });

//   test("unauth for user", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         name: "C1-new",
//       })
//       .set("authorization", `Bearer ${u1Token}`);
//       expect(resp.statusCode).toEqual(401);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         name: "C1-new",
//       });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for non existent company", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/nope`)
//       .send({
//         name: "new nope",
//       })
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request on handle change attempt", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         handle: "c1-new",
//       })
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request on invalid data", async function () {
//     const resp = await request(app)
//       .patch(`/jobs/c1`)
//       .send({
//         logoUrl: "not-a-url",
//       })
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** DELETE /jobs/:handle */

// describe("DELETE /jobs/:handle", function () {
//   test("works for admin", async function () {
//   const resp = await request(app)
//       .delete(`/jobs/c1`)
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.body).toEqual({ deleted: "c1" });
//   });

//     test("unauth for users", async function () {
//       const resp = await request(app)
//         .delete(`/jobs/c1`)
//         .set("authorization", `Bearer ${u1Token}`);
//         expect(resp.statusCode).toEqual(401);
//     });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/c1`);
//       console.log('error response delete',resp)
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found for non existent company", async function () {
//     const resp = await request(app)
//       .delete(`/jobs/nope`)
//       .set("authorization", `Bearer ${admin1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });
