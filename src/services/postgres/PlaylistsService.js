const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor (collaborationsService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
  }

  async addPlaylist ({ name, owner }) {
    const id = `playlists-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON p.owner = u.id LEFT JOIN collaborations c ON c.playlist_id = p.id WHERE p.owner = $1 OR c.user_id = $1',
      values: [owner]
    }

    const { rows } = await this._pool.query(query)
    return rows
  }

  async getPlaylistById (id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!')
    }

    return result.rows[0]
  }

  async deletePlaylistById (id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan!')
    }
  }

  async addSongToPlaylist (playlistId, songId) {
    const id = `playlist_song-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist!')
    }

    return result.rows[0].id
  }

  async getSongInPlaylist (id) {
    const queryPlaylist = await this._pool.query({
      text: 'SELECT p.id, p.name, u.username FROM playlists p LEFT JOIN users u ON p.owner = u.id WHERE p.id = $1',
      values: [id]
    })

    const query = await this._pool.query({
      text: 'SELECT s.id, s.title, s.performer FROM songs s JOIN playlist_songs ps ON s.id = ps.song_id WHERE ps.playlist_id = $1',
      values: [id]
    })

    if (!queryPlaylist.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!')
    }

    return {
      ...queryPlaylist.rows[0],
      songs: query.rows
    }
  }

  async deleteSongFromPlaylist (id) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan!')
    }

    return result.rows[0]
  }

  async addPlaylistActivity (playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO playlists_activities VALUES ($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, userId, action]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist Activity gagal ditambahkan!')
    }

    return result.rows[0].id
  }

  async getPlaylistActivity (playlistId) {
    const query = {
      text: `SELECT u.username, s.title, act.action, act.time FROM playlists_activities act LEFT JOIN playlists p ON 
      psa.playlist_id = p.id LEFT JOIN songs s ON act.song_id = s.id LEFT JOIN users u ON act.user_id = u.id WHERE p.id = $1`,
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Activity tidak ditemukan!')
    }

    return result.rows
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist Owner tidak ditemukan!')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak dapat mengakses playlist ini!')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
    }

    try {
      await this._collaborationsService.verifyCollaborator(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService