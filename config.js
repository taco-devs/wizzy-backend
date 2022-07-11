const env = process.env;

const config = {
  db: { /* do not put password or any sensitive info here, done only for demo */
    host: env.DB_HOST || 'jelani.db.elephantsql.com',
    port: env.DB_PORT || '5432',
    user: env.DB_USER || 'ajlfsenw',
    password: env.DB_PASSWORD || 'lal8XFhRaZwjEzspLXevYQsDC-ZCYvIG',
    database: env.DB_NAME || 'ajlfsenw',
  },
  listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;