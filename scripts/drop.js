
const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);

const DROP = `
    DROP table question;
`


/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query() {
    const drop = await pool.query(DROP);
    console.log(drop);
    return drop;
}

query();