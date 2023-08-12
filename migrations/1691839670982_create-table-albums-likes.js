/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    user_id: {
      type: 'VARCHAR(50)',
      notnull: true,
      references: 'users(id)',
      onDelete: 'cascade'
    },
    album_id: {
      type: 'VARCHAR(50)',
      notnull: true,
      references: 'albums(id)',
      onDelete: 'cascade'
    }
  })

  pgm.addConstraint('album_likes', 'unique_album_likes_album_id_and_user_id', 'UNIQUE(album_id, user_id)')
}

exports.down = pgm => {
  pgm.dropTable('album_likes')
}
