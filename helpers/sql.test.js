const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
    test("works: update all", function () {
        const dataToUpdate = {
            name: 'newName',
            description: 'lalala test',
            numEmployees: 500,
            logoUrl: 'www.jpg.com'
        };
        const jsToSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };
        const sql = sqlForPartialUpdate(dataToUpdate, jsToSql);

        expect(sql).toEqual({
            setCols: '\"name\"=$1, \"description\"=$2, \"num_employees\"=$3, \"logo_url\"=$4',
            values: ['newName', 'lalala test', 500, 'www.jpg.com']
        });
    });

    test("works: 1 update", function () {
        const dataToUpdate = { description: 'lalala test 2' };
        const jsToSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };
        const sql = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(sql).toEqual({
            setCols: '\"description\"=$1',
            values: ['lalala test 2']
        });
    });

    test("error: no update", function () {
        const dataToUpdate = {
        };
        const jsToSql = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };
        try {
            const sql = sqlForPartialUpdate(dataToUpdate, jsToSql);
        } catch (err) {
            expect(err.status).toEqual(400)
        }
    });
});