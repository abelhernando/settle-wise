'use strict'

require('dotenv').config()

const { mongoose, models: { User, Group, Spend } } = require('.')
const { expect } = require('chai')

const { env: { DB_URL } } = process

describe('models (settle-wise)', () => {
    let jackData, annaData, groupData, spendData

    before(() => mongoose.connect(DB_URL))

    beforeEach(() => {
        jackData = { name: 'Jack', surname: 'Johnson', email: 'jj@mail.com', password: '123' }
        annaData = { name: 'Anna', surname: 'Kennedy', email: 'ak@mail.com', password: '456' }
        groupData = { name: 'California' }

        return Promise.all([User.remove(), Group.deleteMany()])
    })

    describe('create user', () => {
        it('should succeed on correct data', () => {
            const user = new User(jackData)

            return user.save()
                .then(user => {
                    expect(user).to.exist
                    expect(user._id).to.exist
                    expect(user.name).to.equal(jackData.name)
                    expect(user.surname).to.equal(jackData.surname)
                    expect(user.email).to.equal(jackData.email)
                    expect(user.password).to.equal(jackData.password)
                })
        })
    })

    describe('create a group', () => {
        it('should succeed on correct data', () =>
            Promise.all([
                User.create(jackData),
                User.create(annaData)
            ])
                .then(res => {
                    const [{ _doc: user1 }, { _doc: user2 }] = res

                    expect(user1).to.exist
                    expect(user1.name).to.equal(jackData.name)

                    expect(user2).to.exist
                    expect(user2.name).to.equal(annaData.name)

                    const group = new Group(groupData)

                    group.users.push(user1._id)
                    group.users.push(user2._id)

                    return group.save()
                        .then(group => {
                            expect(group._id).to.exist
                            expect(group.name).to.equal(groupData.name)

                            const { users: [userId1, userId2] } = group

                            expect(userId1.toString()).to.equal(user1._id.toString())
                            expect(userId2.toString()).to.equal(user2._id.toString())
                        })
                })
        )
    })

    describe('add spend', () => {
        it('should succeed on correct data', () =>
            Promise.all([
                User.create(jackData),
                User.create(annaData)
            ])
                .then(res => {
                    const [{ _doc: user1 }, { _doc: user2 }] = res

                    expect(user1).to.exist
                    expect(user1.name).to.equal(jackData.name)

                    expect(user2).to.exist
                    expect(user2.name).to.equal(annaData.name)

                    const group = new Group(groupData)

                    group.users.push(user1._id)
                    group.users.push(user2._id)

                    const spend = new Spend({
                        user: user2._id,
                        amount: 100,
                        payer: user1._id,
                        fractions: [
                            { user: user1._id, fraction: 75 },
                            { user: user2._id, fraction: 25 }
                        ]
                    })

                    group.spends.push(spend)

                    return group.save()
                        .then(group => {
                            expect(group._id).to.exist
                            expect(group.name).to.equal(groupData.name)

                            const { users: [userId1, userId2] } = group

                            expect(userId1.toString()).to.equal(user1._id.toString())
                            expect(userId2.toString()).to.equal(user2._id.toString())

                            expect(group.spends).to.exist
                            expect(group.spends.length).to.equal(1)

                            const { spends: [spend] } = group

                            expect(spend._id).to.exist
                            expect(spend.user).to.exist
                            expect(spend.user.toString()).to.equal(user2._id.toString())
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
        )
    })

    after(done => mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done)))
})