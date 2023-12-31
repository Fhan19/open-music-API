const autoBind = require('auto-bind')

class ExportsHandler {
  constructor (service, playlistsService, validator) {
    this._service = service
    this._validator = validator
    this._playlistsService = playlistsService

    autoBind(this)
  }

  async postExportPlaylistsHandler (request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload)

    const { playlistId } = request.params
    const { userId } = request.auth.credentials
    const { targetEmail } = request.payload

    await this._playlistsService.verifyPlaylistAccess(playlistId, userId)
    await this._playlistsService.getPlaylistById(playlistId)

    const message = {
      targetEmail,
      playlistId
    }

    await this._service.sendMessage('export:playlists', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang diproses'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
