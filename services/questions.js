
const db = require('./db');
const helper = require('../helper');
const config = require('../config');
const slug = require("slug");
const short = require("short-uuid");
const jwt = require("jsonwebtoken");
const wizzy = require('../gpt3-module/wizzy');

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    'SELECT id, question, answer, author FROM question OFFSET $1 LIMIT $2', 
    [offset, config.listPerPage]
  );
  const data = helper.emptyOrRows(rows);
  const meta = {page};

  return {
    data,
    meta
  }
}


async function getOneBySlug(slug_id) {
  const rows = await db.query(
    ` SELECT *
      FROM question, account 
      WHERE question.slug = $1
    `,
    [slug_id]
  );

  if (rows.length < 1) return {};

  return rows[0];
}

/*  CREATE */
/* Validate CREATE */
function validateCreate(question) {
    let messages = [];
  
    if (!question) {
      messages.push('No question is provided');
    }
  
    if (!question.question) { 
      messages.push('Question is empty');
    }
  
    if (!question.author) {
      messages.push('Author is empty');
    }
  
    if (question.question && question.question.length > 255) {
      messages.push('Question cannot be longer than 255 characters');
    }
  
    if (messages.length) {
      let error = new Error(messages.join());
      error.statusCode = 400;
  
      throw error;
    }
}

async function create(req) {

    const question = req.body;

    validateCreate(question);

    const answer = await wizzy.ask(question.question);
    const pre_slug = slug(question.question);
    const question_uuid = short.generate();

    const question_slug = pre_slug + "-" + question_uuid;

    // Get account id from the one who is validating the token
    const token = req.headers['auth-token'];
    const { slug_id } = jwt.decode(token);

    // Get account from the slug
    const account = await db.query(
      'SELECT id FROM account WHERE slug_id = $1',
      [slug_id]
    )
    
    let message = 'Error in creating question';
    
    if (!account.length) {
      return { message };
    }

    const account_id = account[0].id;

    const result = await db.query(
      'INSERT INTO question(question, slug, answer, author, account_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [question.question, question_slug, answer, question.author, account_id]
    );
    
    if (result.length) {
      message = 'Quote created successfully';
    }
  
    return {message, result};
}
  
module.exports = {
    getMultiple,
    getOneBySlug,
    create
}
