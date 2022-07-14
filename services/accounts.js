
const db = require('./db');

/* CREATE USER */
async function createAccount(account) {
  const result = await db.query(
    'INSERT INTO account(email, username, password) VALUES ($1, $2, $3) RETURNING *;',
    [account.email, account.username, account.password]
  );

  let message = 'Error in creating account';
  
  if (result.length) {
    message = 'Account created successfully';
  }

  return {message, result};
}

/* READ USER BY email */
async function getAccountByEmail(account) {

  const result = await db.query(
    'SELECT * FROM account WHERE email = $1;',
    [account.email]
  );
  
  console.log(result);

  let message = 'No Accounts Found';

  if (result.length) {
    message = 'Account Found';
  }

  return {message, result};
}
  
module.exports = {
    createAccount,
    getAccountByEmail
}
