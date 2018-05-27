exports.up = (knex, Promise) =>
  knex.schema.createTable('users', t => {
    t.increments()
    t.string('first_name').notNullable()
    t.string('last_name').notNullable()
    t.string('cellphone').notNullable()
    t.string('email').notNullable()

    t.timestamps(false, true)

    t.unique('cellphone')
    t.unique('email')
  })

exports.down = (knex, Promise) => knex.schema.dropTable('users')
