const db = require("./db");
var format = require("pg-format");
const helper = require("../helper");
const config = require("../config");
const slug = require("slug");
const short = require("short-uuid");
const jwt = require("jsonwebtoken");
const wizzy = require("../gpt3-module/wizzy");

const createMultiple = async function (answer, question_id) {
  const parse_responses = answer.responses.map((response) => {
    return [response.order_id, response.response, question_id];
  });

  const query = format(`INSERT INTO answer(order_id, answer, question_id) VALUES %L RETURNING *`, parse_responses);

  const result = await db.query(query, []);

  return result;
}

module.exports = { createMultiple };
