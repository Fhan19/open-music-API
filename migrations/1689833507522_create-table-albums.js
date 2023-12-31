/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    name: {
      type: 'TEXT',
      notnull: true
    },
    year: {
      type: 'integer',
      notnull: true
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('albums')
}
