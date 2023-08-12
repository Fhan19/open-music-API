require('dotenv').config()

const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

// Albums
const albums = require('./api/albums')
const AlbumsService = require('./services/postgres/AlbumsService')
const AlbumValidator = require('./validator/albums')

// Songs
const songs = require('./api/songs')
const SongsService = require('./services/postgres/SongsService')
const SongValidator = require('./validator/songs')

// Users
const users = require('./api/users')
const UsersService = require('./services/postgres/UsersService')
const UserValidator = require('./validator/users')

// authentications
const authentications = require('./api/authentications')
const AuthenticationsService = require('./services/postgres/AuthenticationsService')
const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')

// playlists
const playlists = require('./api/playlists')
const PlaylistsService = require('./services/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

// collaborations
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

// Exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

// uploads
const uploads = require('./api/uploads')
const UploadsService = require('./services/postgres/UploadsService')
const UploadsValidator = require('./validator/uploads')

// album likes
const albumlikes = require('./api/albumlikes')
const AlbumsLikesService = require('./services/postgres/AlbumsLikesService')

const StorageService = require('./services/storage/StorageService')

const CacheService = require('./services/redis/CacheService')

const ClientError = require('./exceptions/ClientError')

const config = require('./utils/config.js')

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const authenticationsService = new AuthenticationsService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))
  const uploadsService = new UploadsService()
  const cacheService = new CacheService()
  const albumLikesService = new AlbumsLikesService(albumsService, cacheService)

  const server = Hapi.server({
    port: config.app.port,
    host: config.app.host,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: Jwt
    },
    {
      plugin: Inert
    }
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: config.token.key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: config.token.age
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.id
      }
    })
  })

  await server.register([
    { // albums
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumValidator
      }
    },
    { // songs
      plugin: songs,
      options: {
        service: songsService,
        validator: SongValidator
      }
    },
    { // users
      plugin: users,
      options: {
        service: usersService,
        validator: UserValidator
      }
    },
    { // authentications
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator
      }
    },
    { // playlists
      plugin: playlists,
      options: {
        songsService,
        service: playlistsService,
        validator: PlaylistsValidator
      }
    },
    { // collaborations
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator
      }
    },
    { // exports
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator
      }
    },
    { // uploads
      plugin: uploads,
      options: {
        service: uploadsService,
        storageService,
        validator: UploadsValidator
      }
    },
    { // album likes
      plugin: albumlikes,
      options: {
        service: albumLikesService
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })
        newResponse.code(response.statusCode)
        return newResponse
      }

      if (!response.isServer) {
        return h.continue
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })

      newResponse.code(500)
      console.log(response.message)
      return newResponse
    }

    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
