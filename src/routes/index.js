// Library Imports
const express = require("express")

// Router Imports
const user = require("./user")

// Setting up router for express.
const router = express.Router()

// Adding router middleware.
router.use('/user', user)

module.exports = router