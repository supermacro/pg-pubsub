const {
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  POSTGRES_DB,
  RUNNING_MIGRATION
} = process.env

if (!!RUNNING_MIGRATION && (!POSTGRES_PASSWORD || !POSTGRES_USER || !POSTGRES_DB)) {
  throw new Error('Missing db env variables')
}

module.exports = {
  development: {
    client: 'pg',
    connection:
      `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db/${POSTGRES_DB}`,
    seeds: {
      directory: './seeds/dev'
    },
    pool: { min: 5, max: 50 },
  }
}
