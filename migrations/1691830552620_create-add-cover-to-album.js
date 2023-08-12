/* eslint-disable camelcase */
exports.up = pgm => {
  pgm.addColumn('albums', {
    cover_url: {
      type: 'VARCHAR(255)'
    }
  })
}

exports.down = pgm => {
  pgm.dropColumn('albums', 'cover')
}
