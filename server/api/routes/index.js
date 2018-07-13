const express = require('express')
const bodyParser = require('body-parser')
const logic = require('../../logic')
const jwt = require('jsonwebtoken')
const jwtValidation = require('./utils/jwt-validation')

const router = express.Router()

const { env: { TOKEN_SECRET, TOKEN_EXP } } = process

const jwtValidator = jwtValidation(TOKEN_SECRET)

const jsonBodyParser = bodyParser.json()

router.post('/users', jsonBodyParser, (req, res) => {
    const { body: { name, surname, email, password } } = req

    logic.registerUser(name, surname, email, password)
        .then(id => {
            res.status(201)
            res.json({ status: 'OK', data: id })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.post('/auth', jsonBodyParser, (req, res) => {
    const { body: { email, password } } = req

    logic.authenticateUser(email, password)
        .then(id => {
            const token = jwt.sign({ id }, TOKEN_SECRET, { expiresIn: TOKEN_EXP })

            res.status(200)
            res.json({ status: 'OK', data: { id, token } })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.get('/users/:userId', jwtValidator, (req, res) => {
    const { params: { userId } } = req

    return logic.retrieveUser(userId)
        .then(user => {
            res.status(200)
            res.json({ status: 'OK', data: user })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })

})

router.patch('/users/:userId', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId }, body: { name, surname, email, password, newEmail, newPassword } } = req

    logic.updateUser(userId, name, surname, email, password, newEmail, newPassword)
        .then(() => {
            res.status(200)
            res.json({ status: 'OK' })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.delete('/users/:userId', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId }, body: { email, password } } = req

    logic.unregisterUser(userId, email, password)
        .then(() => {
            res.status(200)
            res.json({ status: 'OK' })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.post('/users/:userId/groups', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId }, body: { name } } = req

    logic.createGroup(userId, name)
        .then(id => {
            res.status(201)
            res.json({ status: 'OK', data: { id, name } })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.get('/users/:userId/groups', jwtValidator, (req, res) => {
    const { params: { userId } } = req;

    logic.listGroupsByUser(userId)
        .then(groups => {
            res.status(200)
            res.json({ status: 'OK', data: groups })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.get('/users/:userId/groups/:groupId', jwtValidator, (req, res) => {
    const { params: { userId, groupId } } = req;

    logic.listUsers(userId, groupId)
        .then(users => {
            res.status(200)
            res.json({ status: 'OK', data: users })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.patch('/users/:userId/groups/:groupId', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId, groupId }, body: { email } } = req

    logic.addUserToGroup(userId, groupId, email)
        .then(users => {
            res.status(200)
            res.json({ status: 'OK', data: users })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.post('/users/:userId/groups/:groupId/spends', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId, groupId }, body: { amount, name, payerId, fractions } } = req

    logic.addSpend(userId, groupId, amount, name, payerId, fractions)
        .then(id => {
            res.status(201)
            res.json({ status: 'OK', data: id })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

router.get('/users/:userId/groups/:groupId/spends', [jwtValidator, jsonBodyParser], (req, res) => {
    const { params: { userId, groupId } } = req

    logic.listSpends(userId, groupId)
        .then(spends => {
            res.status(200)
            res.json({ status: 'OK', data: spends })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})


router.get('/users/:userId/groups/:groupId/balance', jwtValidator, (req, res) => {
    const { params: { userId, groupId } } = req

    logic.splitSpends(userId, groupId)
        .then(balance => {
            res.status(200)
            res.json({ status: 'OK', data: balance })
        })
        .catch(({ message }) => {
            res.status(400)
            res.json({ status: 'KO', error: message })
        })
})

module.exports = router