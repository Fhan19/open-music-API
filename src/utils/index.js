const mapAlbumDBToModel = ({
  id,
  name,
  year
}) => ({
  id,
  name,
  year
})

const mapSongDBToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId
})
module.exports = { mapAlbumDBToModel, mapSongDBToModel }
