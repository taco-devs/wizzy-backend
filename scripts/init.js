
const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);

const INIT = `
    CREATE TABLE question (
        id bigint DEFAULT nextval('question_id_seq'::regclass) NOT NULL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        author character varying(255) NOT NULL,
        public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    INSERT INTO question (question, answer, author) VALUES 
        ('1 +1 ?', '2', 'irving'), 
        ('1 + 2 ?', '3', 'irving'), 
        ('1 + 1 + 2 ?', '4', 'irving');
`


/**
 * Query the database using the pool
 * @param {*} query 
 * @param {*} params 
 * 
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query() {
    const init = await pool.query(INIT);
    console.log(init);
    return init;
}

query();