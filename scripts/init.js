require("dotenv").config();
const { Pool } = require("pg");
const config = require("../config");
const pool = new Pool(config.db);

const INIT_SEQ = `
    CREATE SEQUENCE question_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    CREATE SEQUENCE account_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
    CREATE SEQUENCE answer_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
`;

const INIT_TABLE_QUESTION = `
    CREATE TABLE question (
        id bigint DEFAULT nextval('question_id_seq'::regclass) NOT NULL PRIMARY KEY,
        question TEXT NOT NULL,
        slug TEXT NOT NULL,
        author character varying(255) NOT NULL,
        public BOOLEAN NOT NULL DEFAULT FALSE,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        account_id bigint REFERENCES account(id) NOT NULL
    );
`;
const INIT_TABLE_ANSWER = `
    CREATE TABLE answer (
        id bigint DEFAULT nextval('answer_id_seq'::regclass) NOT NULL PRIMARY KEY,
        order_id bigint NOT NULL,
        answer TEXT NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        question_id bigint REFERENCES question(id) NOT NULL
    );
`;

const INIT_TABLE_ACCOUNT = `
    CREATE TABLE account (
        id bigint DEFAULT nextval('account_id_seq'::regclass) NOT NULL PRIMARY KEY,
        slug_id TEXT NOT NULL,
        username character varying(255) NOT NULL,
        email character varying(255) NOT NULL,
        password TEXT NOT NULL,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
`;

const INIT_INSERT = `
    INSERT INTO question (question, slug, author) VALUES 
    ('1 +1 ?', '1-1', 'irving'), 
    ('1 + 2 ?', '1-2', 'irving'), 
    ('1 + 1 + 2 ?', '1-1-2', 'irving');
`;

/**
 * Query the database using the pool
 * @param {*} query
 * @param {*} params
 *
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query() {
  await pool.query(INIT_SEQ);
  console.log('-- INIT SEQ "question_id_seq, account_id_seq" SUCCESSFUL');
  await pool.query(INIT_TABLE_ACCOUNT);
  console.log('-- INIT TABLE "account" SUCCESSFUL');
  await pool.query(INIT_TABLE_QUESTION);
  console.log('-- INIT TABLE "question" SUCCESSFUL');
  await pool.query(INIT_TABLE_ANSWER);
  console.log('-- INIT TABLE "answer" SUCCESSFUL');
  // await pool.query(INIT_INSERT);
  // console.log('-- INIT INSERT "questions" SUCCESSFUL');
}

query();