/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'TEXT',
      notnull: true
    },
    year: {
      type: 'integer',
      notnull: true
    },
    performer: {
      type: 'TEXT',
      notnull: true
    },
    genre: {
      type: 'TEXT',
      notnull: true
    },
    duration: {
      type: 'integer'
    },
    albumId: {
      type: 'TEXT',
      references: 'albums(id)',
      onDelete: 'cascade'
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('songs')
}
