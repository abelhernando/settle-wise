'use strict'

const { expect } = require('chai')
const logic = require('.')
const api = require('api')

describe('logic (sette-wise)', () => {
    const userData = { name: 'John', surname: 'Doe', email: 'jd@mail.com', password: '123' }

    beforeEach(done => {
        const { email, password } = userData

        api.authenticateUser(email, password)
            .then(id => 
                api.unregisterUser(id, email, password)
            )
            .then(() => done())
            .catch(() => done())
    })

    describe('register', () => {
        it('should succeed on correct data', () => {
            const { name, surname, email, password } = userData

            return logic.registerUser(name, surname, email, password)
                .then(res => expect(res).to.be.true)
        })
    })

    describe('login', () => {
        it('should succeed on correct data', () => {
            const { name, surname, email, password } = userData

            return api.registerUser(name, surname, email, password)
                .then(() => logic.loginUser(email, password))
                .then(res => {
                    expect(res).to.be.true

                    expect(logic.userId).not.to.equal('NO-ID')
                })
        })
    })
})