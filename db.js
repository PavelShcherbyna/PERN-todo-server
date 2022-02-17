const Pool = require("pg").Pool;
const pool = new Pool({
  user: "pavel",
  password: "111111",
  host: "localhost",
  port: 5432,
  database: "perntodo",
});

module.exports = pool;


