const db = require("./db");

/* CREATE USER */
async function createTransaction(transaction) {
  // TYPES
  // 1 - 'ADD' When user buys credits
  // 2 - 'QUESTION' when user uses credits for a question
  // 3 - 'ANSWER' when user uses credits for additional answer

  const result = await db.query(
    "INSERT INTO transaction(amount, type, account_id, question_id, answer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [transaction.amount, transaction.type, transaction.account_id, transaction.question_id, transaction.answer_id]
  );

  let new_tx;
  let message = "Error creating transaction";

  if (result.length) {
    message = "Transaction created";
    new_tx = result[0];
  }

  return { message, transaction: new_tx };
}

module.exports = {
    createTransaction
};
