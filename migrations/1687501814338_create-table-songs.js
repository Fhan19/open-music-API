/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'VARCHAR(50)',
      primarykey: true
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
    album_id: {
      type: 'TEXT'
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('songs')
}
