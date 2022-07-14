
const db = require('./db');
const helper = require('../helper');
const config = require('../config');
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

/*  CREATE */
/* Validate CREATE */
function validateCreate(question) {
    let messages = [];
  
    console.log(question);
  
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

async function create(question) {
    validateCreate(question);

    const answer = await wizzy.ask(question.question);

    const result = await db.query(
      'INSERT INTO question(question, answer, author) VALUES ($1, $2, $3) RETURNING *',
      [question.question, answer, question.author]
    );
    
    let message = 'Error in creating quote';
  
    if (result.length) {
      message = 'Quote created successfully';
    }
  
    return {message, result};
}
  
module.exports = {
    getMultiple,
    create
}
