const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const ClientError = require('../../exceptions/ClientError')

class AlbumsLikesService {
  constructor (albumsService, cacheService) {
    this._albumsService = albumsService
    this._cacheService = cacheService
    this._pool = new Pool()
  }

  async addAlbumLike (albumId, userId) {
    const id = `like-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError(
        'Gagal menyukai album.'
      )
    }

    await this._cacheService.delete(`albumlikes:${albumId}`)
    return result.rows[0].id
  }

  async getAlbumLikesByAlbumId (albumId) {
    try {
      const result = await this._cacheService.get(`albumlikes:${albumId}`)
      return {
        likes: JSON.parse(result),
        cache: true
      }
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM album_likes WHERE album_id = $1',
        values: [albumId]
      }

      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new NotFoundError('Album tidak ditemukan!')
      }

      const likes = Number(result.rows[0].count)

      await this._cacheService.set(`albumlikes:${albumId}`, likes)

      return {
        likes,
        cache: false
      }
    }
  }

  async deleteAlbumLikeByAlbumId (albumId, userId) {
    const query = {
      text: 'DELETE FROM album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Anda belum menyukai album ini')
    }

    await this._cacheService.delete(`albumlikes:${albumId}`)
  }

  async verifyUserAlbumLike (albumId, userId) {
    await this._albumsService.getAlbumById(albumId)
    const query = {
      text: 'SELECT * FROM album_likes WHERE album_id = $1 AND user_id = $2',
      values: [albumId, userId]
    }

    const result = await this._pool.query(query)

    if (result.rowCount > 0) {
      throw new ClientError('Anda sudah menyukai album ini.')
    }
  }
}

module.exports = AlbumsLikesService
