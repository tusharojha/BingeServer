module.exports = {
    MongoDBUrl: process.env.MONGODB_URI || 'localhost:2717/Binge',
    TOKEN_SALT: process.env.TOKEN_SALT || 'slkdjfslkfjslkdfjlksjrqw',
    TOKEN_ROUTES: process.env.TOKEN_ROUTES || 'khxdfohwoenlelhqoewes',
    PORT: process.env.PORT || 3000
}