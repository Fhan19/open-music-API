/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    name: {
      type: 'VARCHAR(50)',
      notnull: true
    },
    owner: {
      type: 'VARCHAR(50)',
      notnull: true,
      references: 'users(id)',
      onUpdate: 'cascade',
      onDelete: 'cascade'
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('playists')
}
