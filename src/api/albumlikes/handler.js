const autoBind = require('auto-bind')

class AlbumsLikesHandler {
  constructor (service) {
    this._service = service

    autoBind(this)
  }

  async postAlbumLikeHandler (request, h) {
    const { id: albumId } = request.params
    const { userId } = request.auth.credentials

    await this._service.verifyUserAlbumLike(albumId, userId)
    await this._service.addAlbumLike(albumId, userId)

    const response = h.response({
      status: 'success',
      message: 'Album disukai'
    })

    response.code(201)
    return response
  }

  async getAlbumLikeHandler (request, h) {
    const { id: albumId } = request.params
    const { cache, likes } = await this._service.getAlbumLikesByAlbumId(albumId)

    const response = h.response({
      status: 'success',
      data: {
        likes
      }
    })

    if (cache) response.header('X-Data-Source', 'cache')

    return response
  }

  async deleteAlbumLikeHandler (request) {
    const { id: albumId } = request.params
    const { userId } = request.auth.credentials

    await this._service.deleteAlbumLikeByAlbumId(albumId, userId)

    return {
      status: 'success',
      message: 'Album batal disukai'
    }
  }
}

module.exports = AlbumsLikesHandler
