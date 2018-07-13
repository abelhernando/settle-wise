'use strict'

require('dotenv').config()

const { mongoose, models: { User, Group, Spend } } = require('data')
const { expect } = require('chai')
const api = require('./index')
const _ = require('lodash')
const sinon = require('sinon')
const axios = require('axios')
const jwt = require('jsonwebtoken')

const { env: { DB_URL, API_URL, TOKEN_SECRET } } = process

api.url = API_URL

describe('logic (settle-wise api)', () => {
    const userData = { name: 'John', surname: 'Doe', email: 'jd@mail.com', password: '123' }
    const userData2 = { name: 'Jack', surname: 'Wayne', email: 'jw@mail.com', password: '456' }
    const groupData = { name: 'California' }
    const fakeUserId = '123456781234567812345678'
    const fakeNoteId = '123456781234567812345678'
    const groupName = 'California'
    const indexes = []

    before(() => mongoose.connect(DB_URL))

    beforeEach(() => {
        let count = 10 + Math.floor(Math.random() * 10)
        indexes.length = 0
        while (count--) indexes.push(count)

        return Promise.all([User.remove(), Group.deleteMany()]) // or User.deleteMany()
    })

    describe('register user', () => {
        it('should succeed on correct dada', () =>
            api.registerUser('John', 'Doe', 'jd@mail.com', '123')
                .then(res => expect(res).to.be.true)
        )

        it('should fail on already registered user', () =>
            User.create(userData)
                .then(() => {
                    const { name, surname, email, password } = userData

                    return api.registerUser(name, surname, email, password)
                })
                .catch(({ message }) => {
                    expect(message).to.equal(`user with email ${userData.email} already exists`)
                })
        )

        it('should fail on no user name', () =>
            api.registerUser()
                .catch(({ message }) => expect(message).to.equal('user name is not a string'))
        )

        it('should fail on empty user name', () =>
            api.registerUser('')
                .catch(({ message }) => expect(message).to.equal('user name is empty or blank'))
        )

        it('should fail on blank user name', () =>
            api.registerUser('     ')
                .catch(({ message }) => expect(message).to.equal('user name is empty or blank'))
        )

        it('should fail on no user surname', () =>
            api.registerUser(userData.name)
                .catch(({ message }) => expect(message).to.equal('user surname is not a string'))
        )

        it('should fail on empty user surname', () =>
            api.registerUser(userData.name, '')
                .catch(({ message }) => expect(message).to.equal('user surname is empty or blank'))
        )

        it('should fail on blank user surname', () =>
            api.registerUser(userData.name, '     ')
                .catch(({ message }) => expect(message).to.equal('user surname is empty or blank'))
        )

        it('should fail on no user email', () =>
            api.registerUser(userData.name, userData.surname)
                .catch(({ message }) => expect(message).to.equal('user email is not a string'))
        )

        it('should fail on empty user email', () =>
            api.registerUser(userData.name, userData.surname, '')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on blank user email', () =>
            api.registerUser(userData.name, userData.surname, '     ')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on no user password', () =>
            api.registerUser(userData.name, userData.surname, userData.email)
                .catch(({ message }) => expect(message).to.equal('user password is not a string'))
        )

        it('should fail on empty user password', () =>
            api.registerUser(userData.name, userData.surname, userData.email, '')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        it('should fail on blank user password', () =>
            api.registerUser(userData.name, userData.surname, userData.email, '     ')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        describe('on unexpected server behavior', () => {
            let sandbox

            beforeEach(() => sandbox = sinon.createSandbox())

            afterEach(() => sandbox.restore())

            it('should fail on response status hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    resolve({ status: 201, data: { status: 'KO' } })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { name, surname, email, password } = userData

                return api.registerUser(name, surname, email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal(`unexpected response status 201 (KO)`)
                    })
            })

            it('should fail on email hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ response: { data: { error: 'email is not a string' } } })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { name, surname, email, password } = userData

                return api.registerUser(name, surname, email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal('email is not a string')
                    })
            })

            it('should fail on server down', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ code: 'ECONNREFUSED' })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { name, surname, email, password } = userData

                return api.registerUser(name, surname, email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal('could not reach server')
                    })
            })
        })
    })

    describe('authenticate user', () => {
        it('should succeed on correct data', () =>
            User.create(userData)
                .then(() =>
                    api.authenticateUser('jd@mail.com', '123')
                        .then(id => {
                            expect(id).to.exist

                            expect(api.token).not.to.equal('NO-TOKEN')
                        })
                )
        )

        it('should fail on no user email', () =>
            api.authenticateUser()
                .catch(({ message }) => expect(message).to.equal('user email is not a string'))
        )

        it('should fail on empty user email', () =>
            api.authenticateUser('')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on blank user email', () =>
            api.authenticateUser('     ')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on no user password', () =>
            api.authenticateUser(userData.email)
                .catch(({ message }) => expect(message).to.equal('user password is not a string'))
        )

        it('should fail on empty user password', () =>
            api.authenticateUser(userData.email, '')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        it('should fail on blank user password', () =>
            api.authenticateUser(userData.email, '     ')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        describe('on unexpected server behavior', () => {
            let sandbox

            beforeEach(() => sandbox = sinon.createSandbox())

            afterEach(() => sandbox.restore())

            it('should fail on response status hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    resolve({ status: 200, data: { status: 'KO' } })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { email, password } = userData

                return api.authenticateUser(email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal(`unexpected response status 200 (KO)`)
                    })
            })

            it('should fail on email hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ response: { data: { error: 'email is not a string' } } })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { email, password } = userData

                return api.authenticateUser(email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal('email is not a string')
                    })
            })

            it('should fail on server down', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ code: 'ECONNREFUSED' })
                })

                sandbox.stub(axios, 'post').returns(resolved)

                const { email, password } = userData

                return api.authenticateUser(email, password)
                    .catch(({ message }) => {
                        expect(message).to.equal('could not reach server')
                    })
            })
        })
    })

    describe('retrieve user', () => {
        it('should succeed on correct data', () =>
            User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    return api.retrieveUser(id)
                })
                .then(user => {
                    expect(user).to.exist

                    const { name, surname, email, _id, password, notes } = user

                    expect(name).to.equal('John')
                    expect(surname).to.equal('Doe')
                    expect(email).to.equal('jd@mail.com')

                    expect(_id).to.be.undefined
                    expect(password).to.be.undefined
                    expect(notes).to.be.undefined
                })
        )

        it('should fail on no user id', () =>
            api.retrieveUser()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.retrieveUser('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.retrieveUser('     ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        describe('on unexpected server behavior', () => {
            let sandbox

            beforeEach(() => sandbox = sinon.createSandbox())

            afterEach(() => sandbox.restore())

            it('should fail on response status hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    resolve({ status: 200, data: { status: 'KO' } })
                })

                sandbox.stub(axios, 'get').returns(resolved)

                return api.retrieveUser(fakeUserId)
                    .catch(({ message }) => {
                        expect(message).to.equal(`unexpected response status 200 (KO)`)
                    })
            })

            it('should fail on id hacked', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ response: { data: { error: 'user id is not a string' } } })
                })

                sandbox.stub(axios, 'get').returns(resolved)

                return api.retrieveUser(fakeUserId)
                    .catch(({ message }) => {
                        expect(message).to.equal('user id is not a string')
                    })
            })

            it('should fail on server down', () => {
                const resolved = new Promise((resolve, reject) => {
                    reject({ code: 'ECONNREFUSED' })
                })

                sandbox.stub(axios, 'get').returns(resolved)

                return api.retrieveUser(fakeUserId)
                    .catch(({ message }) => {
                        expect(message).to.equal('could not reach server')
                    })
            })
        })
    })

    describe('udpate user', () => {
        it('should succeed on correct data', () =>
            User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    return api.updateUser(id, 'Jack', 'Wayne', 'jd@mail.com', '123', 'jw@mail.com', '456')
                        .then(res => {
                            expect(res).to.be.true

                            return User.findById(id)
                        })
                        .then(user => {
                            expect(user).to.exist

                            const { name, surname, email, password } = user

                            expect(user.id).to.equal(id)
                            expect(name).to.equal('Jack')
                            expect(surname).to.equal('Wayne')
                            expect(email).to.equal('jw@mail.com')
                            expect(password).to.equal('456')
                        })
                })
        )

        it('should fail on changing email to an already existing user\'s email', () =>
            Promise.all([
                User.create(userData),
                User.create(userData2)
            ])
                .then(([{ id: id1 }, { id: id2 }]) => {
                    const token = jwt.sign({ id: id1 }, TOKEN_SECRET)

                    api.token = token

                    const { name, surname, email, password } = userData

                    return api.updateUser(id1, name, surname, email, password, userData2.email)
                })
                .catch(({ message }) => expect(message).to.equal(`user with email ${userData2.email} already exists`))
        )

        it('should fail on no user id', () =>
            api.updateUser()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.updateUser('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.updateUser('     ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on no user name', () =>
            api.updateUser(fakeUserId)
                .catch(({ message }) => expect(message).to.equal('user name is not a string'))
        )

        it('should fail on empty user name', () =>
            api.updateUser(fakeUserId, '')
                .catch(({ message }) => expect(message).to.equal('user name is empty or blank'))
        )

        it('should fail on blank user name', () =>
            api.updateUser(fakeUserId, '     ')
                .catch(({ message }) => expect(message).to.equal('user name is empty or blank'))
        )

        it('should fail on no user surname', () =>
            api.updateUser(fakeUserId, userData.name)
                .catch(({ message }) => expect(message).to.equal('user surname is not a string'))
        )

        it('should fail on empty user surname', () =>
            api.updateUser(fakeUserId, userData.name, '')
                .catch(({ message }) => expect(message).to.equal('user surname is empty or blank'))
        )

        it('should fail on blank user surname', () =>
            api.updateUser(fakeUserId, userData.name, '     ')
                .catch(({ message }) => expect(message).to.equal('user surname is empty or blank'))
        )

        it('should fail on no user email', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname)
                .catch(({ message }) => expect(message).to.equal('user email is not a string'))
        )

        it('should fail on empty user email', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname, '')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on blank user email', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname, '     ')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on no user password', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname, userData.email)
                .catch(({ message }) => expect(message).to.equal('user password is not a string'))
        )

        it('should fail on empty user password', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname, userData.email, '')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        it('should fail on blank user password', () =>
            api.updateUser(fakeUserId, userData.name, userData.surname, userData.email, '     ')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )
    })

    describe('unregister user', () => {
        it('should succeed on correct data', () =>
            User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    const { email, password } = userData

                    return api.unregisterUser(id, email, password)
                        .then(res => {
                            expect(res).to.be.true

                            return User.findById(id)
                        })
                        .then(user => {
                            expect(user).to.be.null
                        })
                })
        )

        it('should fail on no user id', () =>
            api.unregisterUser()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.unregisterUser('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.unregisterUser('     ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on no user email', () =>
            api.unregisterUser(fakeUserId)
                .catch(({ message }) => expect(message).to.equal('user email is not a string'))
        )

        it('should fail on empty user email', () =>
            api.unregisterUser(fakeUserId, '')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on blank user email', () =>
            api.unregisterUser(fakeUserId, '     ')
                .catch(({ message }) => expect(message).to.equal('user email is empty or blank'))
        )

        it('should fail on no user password', () =>
            api.unregisterUser(fakeUserId, userData.email)
                .catch(({ message }) => expect(message).to.equal('user password is not a string'))
        )

        it('should fail on empty user password', () =>
            api.unregisterUser(fakeUserId, userData.email, '')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )

        it('should fail on blank user password', () =>
            api.unregisterUser(fakeUserId, userData.email, '     ')
                .catch(({ message }) => expect(message).to.equal('user password is empty or blank'))
        )
    })

    describe('create group', () => {
        it('should succeed on correct data', () =>
            User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    return api.createGroup(id, groupName)
                        .then(groupId => {
                            expect(groupId).to.exist
                            expect(groupId).to.be.string
                        })
                })
        )

        it('should fail on wrong user id', () =>
            User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    return api.createGroup(fakeUserId, groupName)
                        .catch(({ message }) => expect(message).to.equal(`user id ${fakeUserId} does not match token user id ${id}`))
                })
        )

        it('should fail on no user id', () =>
            api.createGroup()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.createGroup('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.createGroup('     ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on no group name', () => {
            api.createGroup(fakeUserId)
                .catch(({ message }) => expect(message).to.equal('group name is not a string'))
        })

        it('should fail on empty group name', () =>
            api.createGroup(fakeUserId, '')
                .catch(({ message }) => expect(message).to.equal('group name is empty or blank'))
        )

        it('should fail on blank group name', () =>
            api.createGroup(fakeUserId, '   ')
                .catch(({ message }) => expect(message).to.equal('group name is empty or blank'))
        )
    })

    describe('list groups by user id', () => {
        it('should succeed on correct data', () => {
            return User.create(userData)
                .then(({ id }) => {
                    const token = jwt.sign({ id }, TOKEN_SECRET)

                    api.token = token

                    return Promise.all(
                        [api.createGroup(id.toString(), `group 1`),
                        api.createGroup(id.toString(), `group 2`)
                        ])
                        .then(groups => {
                            expect(groups.length).to.equal(2)
                        })

                    return api.listGroupsByUser(id.toString())
                        .then(groups => {
                            expect(groups.length).to.equal(validGroupIds.length)
                            groups.forEach(group => {
                                expect(group._id).to.exist
                                expect(validGroupIds).to.include(group._id.toString())

                                expect(group.users).to.exist
                                expect(group.users.length).to.equal(1)

                                const userIds = group.users.map(userId => userId.toString())

                                expect(userIds).to.include(user1._id.toString())
                            })
                        })
                })
        })
        it('should fail on non user id', () =>
            api.listGroupsByUser()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.listGroupsByUser('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.listGroupsByUser('      ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )
    })

    describe('add a user to a existent group', () => {
        it('should succeed on correct data', () =>
            Promise.all([
                User.create(userData),
                User.create(userData2)
            ])
                .then(([{ id: id1 }, { id: id2 }]) => {
                    const token = jwt.sign({ id: id1 }, TOKEN_SECRET)

                    api.token = token

                    const { name, surname, email, password } = userData2

                    return api.createGroup(id1, groupName)
                        .then(groupId => {
                            expect(groupId).to.exist
                            expect(groupId).to.be.string

                            return api.addUserToGroup(id1, groupId, email)
                                .then(adduser => {
                                    expect(adduser).to.be.true
                                })
                        })
                })
        )
        it('should fail on non user id', () =>
            api.addUserToGroup()
                .catch(({ message }) => expect(message).to.equal('user id is not a string'))
        )

        it('should fail on empty user id', () =>
            api.addUserToGroup('')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )

        it('should fail on blank user id', () =>
            api.addUserToGroup('      ')
                .catch(({ message }) => expect(message).to.equal('user id is empty or blank'))
        )
        it('should fail on non group id', () =>
            api.addUserToGroup('123')
                .catch(({ message }) => expect(message).to.equal('group id is not a string'))
        )

        it('should fail on empty group id', () =>
            api.addUserToGroup('123', '')
                .catch(({ message }) => expect(message).to.equal('group id is empty or blank'))
        )

        it('should fail on blank group id', () =>
            api.addUserToGroup('123', '      ')
                .catch(({ message }) => expect(message).to.equal('group id is empty or blank'))
        )
    })

    describe('add a spend to a existent group', () => {
        it('should succeed on correct data', () =>
            Promise.all([
                User.create(userData),
                User.create(userData2)
            ])
                .then(res => {
                    const [{ _doc: user1 }, { _doc: user2 }] = res

                    expect(user1).to.exist
                    expect(user1.name).to.equal(userData.name)

                    expect(user2).to.exist
                    expect(user2.name).to.equal(userData2.name)

                    const group = new Group(groupData)

                    group.users.push(user1._id)
                    group.users.push(user2._id)

                    return group.save()
                        .then(group => {
                            expect(group._id).to.exist
                            expect(group.name).to.equal(groupData.name)

                            const token = jwt.sign({ id: user1._id.toString() }, TOKEN_SECRET)

                            api.token = token

                            return api.addSpend(user1._id.toString(), group._id.toString(), 100, user1._id.toString(), [
                                { user: user1._id.toString(), fraction: 75 },
                                { user: user2._id.toString(), fraction: 25 }
                            ])
                                .then(res => expect(res).to.be.true)
                                .then(() => Group.findById(group.id))
                                .then(group => {
                                    const { users: [userId1, userId2] } = group

                                    expect(userId1.toString()).to.equal(user1._id.toString())
                                    expect(userId2.toString()).to.equal(user2._id.toString())

                                    expect(group.spends).to.exist
                                    expect(group.spends.length).to.equal(1)

                                    const { spends: [spend] } = group

                                    expect(spend._id).to.exist
                                    expect(spend.amount).to.equal(100)
                                    expect(spend.payer).to.exist
                                    expect(spend.payer.toString()).to.equal(user1._id.toString())
                                    expect(spend.fractions).to.exist
                                    expect(spend.fractions.length).to.equal(2)

                                    const { fractions: [fraction1, fraction2] } = spend

                                    expect(fraction1.user).to.exist
                                    expect(fraction1.user.toString()).to.equal(user1._id.toString())
                                    expect(fraction1.fraction).to.equal(75)

                                    expect(fraction2.user).to.exist
                                    expect(fraction2.user.toString()).to.equal(user2._id.toString())
                                    expect(fraction2.fraction).to.equal(25)
                                })
                        })
                })
        )
    })
    describe('list all spends of an existent group', () => {
        it('should succeed on correct data', () =>
            Promise.all([
                User.create(userData),
                User.create(userData2)
            ])
                .then(res => {
                    const [{ _doc: user1 }, { _doc: user2 }] = res

                    expect(user1).to.exist
                    expect(user1.name).to.equal(userData.name)

                    expect(user2).to.exist
                    expect(user2.name).to.equal(userData2.name)

                    const group = new Group(groupData)

                    group.users.push(user1._id)
                    group.users.push(user2._id)

                    return group.save()
                        .then(group => {
                            expect(group._id).to.exist
                            expect(group.name).to.equal(groupData.name)

                            const token = jwt.sign({ id: user1._id.toString() }, TOKEN_SECRET)

                            api.token = token

                            // TODO use mongoose instead, not api here for adding a spend
                            return api.addSpend(user1._id.toString(), group._id.toString(), 100, user1._id.toString(), [
                                { user: user1._id.toString(), fraction: 75 },
                                { user: user2._id.toString(), fraction: 25 }
                            ])
                                .then(res => expect(res).to.be.true)
                                .then(() => Group.findById(group.id))
                                .then(group => {
                                    const { users: [userId1, userId2] } = group

                                    expect(userId1.toString()).to.equal(user1._id.toString())
                                    expect(userId2.toString()).to.equal(user2._id.toString())

                                    expect(group.spends).to.exist
                                    expect(group.spends.length).to.equal(1)

                                    const { spends: [spend] } = group

                                    expect(spend._id).to.exist
                                    expect(spend.amount).to.equal(100)
                                    expect(spend.payer).to.exist
                                    expect(spend.payer.toString()).to.equal(user1._id.toString())
                                    expect(spend.fractions).to.exist
                                    expect(spend.fractions.length).to.equal(2)

                                    const { fractions: [fraction1, fraction2] } = spend

                                    expect(fraction1.user).to.exist
                                    expect(fraction1.user.toString()).to.equal(user1._id.toString())
                                    expect(fraction1.fraction).to.equal(75)

                                    expect(fraction2.user).to.exist
                                    expect(fraction2.user.toString()).to.equal(user2._id.toString())
                                    expect(fraction2.fraction).to.equal(25)

                                    return api.listSpends(userId1.toString(), group.id)
                                        .then(res => {
                                            expect(res).to.exist
                                            
                                        })
                                })
                        })
                })
        )
    })


    after(done => mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done)))
})