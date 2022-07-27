const db = require("./db");

/* CREATE USER */
async function createAccount(account) {
  const result = await db.query(
    "INSERT INTO account(email, slug_id, username, password) VALUES ($1, $2, $3, $4) RETURNING *;",
    [account.email, account.slug_id, account.username, account.password]
  );

  let new_account;
  let message = "Error creating account";

  if (result.length) {
    message = "Account created Found";
    new_account = result[0];
  }

  return { message, new_account };
}

/* CREATE USER */
async function createTwitterAccount(account) {
  const result = await db.query(
    "INSERT INTO account(username, email, slug_id, twitter_id, twitter_screen_name, twitter_profile_image_url_https) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
    [
      account.username,
      account.email,
      account.slug_id,
      account.twitter_id,
      account.twitter_screen_name,
      account.twitter_profile_image_url_https,
    ]
  );

  let message = "Error in creating account";

  if (result.length) {
    message = "Account created successfully";
  }

  return { message, result };
}

/* READ USER BY email */
async function getAccountByEmail(account) {

  const result = await db.query("SELECT * FROM account WHERE email = $1;", [
    account.email,
  ]);

  let message = "No Accounts Found";

  if (result.length) {
    message = "Account Found";
  }

  return { message, result };
}

/* READ USER BY email */
async function getAccountBySlug(slug) {

  const result = await db.query("SELECT * FROM account WHERE slug_id = $1;", [
    slug
  ]);

  let message = "No Accounts Found";

  if (result.length) {
    message = "Account Found";
  }

  return { message, result };
}

/* READ USER BY email */
async function getAccountByTwitterId(twitter_id) {
  const result = await db.query(
    "SELECT * FROM account WHERE twitter_id = $1;",
    [twitter_id]
  );

  let account;
  let message = "No Accounts Found";

  if (result.length) {
    message = "Account Found";
    account = result[0];
  }

  return { message, account };
}

module.exports = {
  createAccount,
  createTwitterAccount,
  getAccountByEmail,
  getAccountBySlug,
  getAccountByTwitterId,
};
