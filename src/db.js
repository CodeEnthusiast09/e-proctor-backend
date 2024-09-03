const Pool = require("pg").Pool;

const pool = new Pool({
  user: "dapo",
  password: "1234",
  host: "localhost",
  port: "5432",
  database: "eproctor",
});

module.exports = pool;
