require('dotenv').config();
const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);

const DROP_TABLE_QUESTION = `
    DROP table question;
`

const DROP_TABLE_ACCOUNT = `
    DROP table account;
`

const DROP_SEQ = `
    DROP SEQUENCE question_id_seq;
    DROP SEQUENCE account_id_seq;
`



/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query() {
    await pool.query(DROP_TABLE_QUESTION);
    console.log('-- DROP TABLE "question" SUCCESSFUL');
    await pool.query(DROP_TABLE_ACCOUNT);
    console.log('-- DROP TABLE "account" SUCCESSFUL');
    await pool.query(DROP_SEQ);
    console.log('-- DROP SEQUENCES "question_id_seq, account_id_seq" SUCCESSFUL');
}

query();