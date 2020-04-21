// Library Imports
const express = require("express")

// Router Imports
const user = require("./user")

const router = express.Router()

router.use('/user', user)

module.exports = router