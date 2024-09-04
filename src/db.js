const Pool = require("pg").Pool;

// const pool = new Pool({
//   user: "dapo",
//   password: "1234",
//   host: "localhost",
//   port: "5432",
//   database: "eproctor",
// });

const pool = new Pool({
  user: "dapo",
  password: "oNHAZXM9WaSQ5qNCE7QIUEWOvz1wzvxB",
  host: "dpg-crbnvbjv2p9s73dj4fng-a",
  port: "5432",
  database: "eproctor",
});

module.exports = pool;
