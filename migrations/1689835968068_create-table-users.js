/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('users', {
    id: {
      type: 'VARCHAR(50)',
      primarykey: true
    },
    username: {
      type: 'VARCHAR(50)',
      notnull: true
    },
    password: {
      type: 'TEXT',
      notnull: true
    },
    fullname: {
      type: 'TEXT',
      notnull: true
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('users')
}
