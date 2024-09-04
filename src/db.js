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
  host: "postgresql://dapo:oNHAZXM9WaSQ5qNCE7QIUEWOvz1wzvxB@dpg-crbnvbjv2p9s73dj4fng-a.frankfurt-postgres.render.com/eproctor",
  port: "5432",
  database: "eproctor",
});

module.exports = pool;
