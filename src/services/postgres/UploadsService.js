const { Pool } = require('pg')

const NotFoundError = require('../../exceptions/NotFoundError')

class UploadsService {
  constructor () {
    this._pool = new Pool()
  }

  async editAlbumCover (id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError(
        'Cover Album gagal diperbarui. Id tidak ditemukan!'
      )
    }
  }
}

module.exports = UploadsService
