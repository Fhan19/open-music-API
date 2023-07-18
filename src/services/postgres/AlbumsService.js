const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapAlbumDBToModel } = require('../../utils')

class AlbumsService {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum ({ name, year }) {
    const id = 'album-' + nanoid(16)

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const album = await this._pool.query(albumQuery)

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    const songQuery = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id]
    }

    const song = await this._pool.query(songQuery)

    const result = { album: album.rows.map(mapAlbumDBToModel)[0] }
    if (!song.rows.length) {
      result.songs = []
      return result
    }

    result.songs = song.rows.map((s) => ({
      id: s.id,
      title: s.title,
      performer: s.performer
    }))
    return result
  }

  async editAlbumById (id, { name, year }) {
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
