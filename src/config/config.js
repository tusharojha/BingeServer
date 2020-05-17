module.exports = {
    MongoDBUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/Binge',
    TOKEN_SALT: process.env.TOKEN_SALT || 'alkjdfslkdjfsljdls',
    TOKEN_ROUTES: process.env.TOKEN_ROUTES || 'lskflskjflksdjds',
    PORT: process.env.PORT || 3000
}