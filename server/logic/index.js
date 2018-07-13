'use strict'

const { mongoose, models: { User, Group, Spend } } = require('data')
const { Types: { ObjectId } } = mongoose

const logic = {

    /**
     * Register user 
     * 
     * @param {string} name name of the user
     * @param {string} surname surname of the user
     * @param {string} email used as userName too
     * @param {string} password 
     * 
     * @throws {Error} if register email already exists
     * 
     * @returns {Promise<string>} the user ID
     */
    registerUser(name, surname, email, password) {
        return Promise.resolve()
            .then(() => {

                if (typeof name !== 'string') throw Error('user name is not a string')

                if (!(name = name.trim()).length) throw Error('user name is empty or blank')

                if (typeof surname !== 'string') throw Error('user surname is not a string')

                if ((surname = surname.trim()).length === 0) throw Error('user surname is empty or blank')

                if (typeof email !== 'string') throw Error('user email is not a string')

                if (!(email = email.trim()).length) throw Error('user email is empty or blank')

                if (typeof password !== 'string') throw Error('user password is not a string')

                if ((password = password.trim()).length === 0) throw Error('user password is empty or blank')

                return User.findOne({ email })
                    .then(user => {
                        if (user) throw Error(`user with email ${email} already exists`)

                        return User.create({ name, surname, email, password })
                            .then(user => user._id)
                    })
            })
    },

    /**
     * Authenticate user to retrieve user id and token
     * 
     * @param {string} email user email
     * @param {string} password password of the user
     * 
     * @throws {Error} if the user does not exist
     * 
     * @returns {Promise<string>} the user id
     * 
     */
    authenticateUser(email, password) {
        return Promise.resolve()
            .then(() => {
                if (typeof email !== 'string') throw Error('user email is not a string')

                if (!(email = email.trim()).length) throw Error('user email is empty or blank')

                if (typeof password !== 'string') throw Error('user password is not a string')

                if ((password = password.trim()).length === 0) throw Error('user password is empty or blank')

                return User.findOne({ email, password })
            })
            .then(user => {
                if (!user) throw Error('wrong credentials')

                return user.id
            })
    },

    /**
    * Retrieves the user's information
    * 
    * @param {string} id The user Id
    * 
    * @throws {Error} If the user id is not found
    * 
    * @returns {Promise<User>} All the information of the user
    */
    retrieveUser(id) {
        return Promise.resolve()
            .then(() => {
                if (typeof id !== 'string') throw Error('user id is not a string')

                if (!(id = id.trim()).length) throw Error('user id is empty or blank')

                return User.findById(id).select({ _id: 0, name: 1, surname: 1, email: 1 })
            })
            .then(user => {
                if (!user) throw Error(`no user found with id ${id}`)

                return user
            })
    },

    /**
     * Updates the user information, if email and password are not changed the originals will persist
     * 
     * @param {string} id Necessary to look for the user
     * @param {string} name optional - user name
     * @param {string} surname optional - surname of the user
     * @param {string} email optional - email of the user
     * @param {string} password optional - password of the user
     * @param {string} [newEmail] optional - change email
     * @param {string} [newPassword] optional - change password
     * 
     * @returns {Promise<boolean>} True, if the changes are applied
     */
    updateUser(id, name, surname, email, password, newEmail, newPassword) {
        return Promise.resolve()
            .then(() => {
                if (typeof id !== 'string') throw Error('user id is not a string')

                if (!(id = id.trim()).length) throw Error('user id is empty or blank')

                if (typeof name !== 'string') throw Error('user name is not a string')

                if (!(name = name.trim()).length) throw Error('user name is empty or blank')

                if (typeof surname !== 'string') throw Error('user surname is not a string')

                if ((surname = surname.trim()).length === 0) throw Error('user surname is empty or blank')

                if (typeof email !== 'string') throw Error('user email is not a string')

                if (!(email = email.trim()).length) throw Error('user email is empty or blank')

                if (typeof password !== 'string') throw Error('user password is not a string')

                if ((password = password.trim()).length === 0) throw Error('user password is empty or blank')

                return User.findOne({ email, password })
            })
            .then(user => {
                if (!user) throw Error('wrong credentials')

                if (user.id !== id) throw Error(`no user found with id ${id} for given credentials`)

                if (newEmail) {
                    return User.findOne({ email: newEmail })
                        .then(_user => {
                            if (_user && _user.id !== id) throw Error(`user with email ${newEmail} already exists`)

                            return user
                        })
                }

                return user
            })
            .then(user => {
                user.name = name
                user.surname = surname
                user.email = newEmail ? newEmail : email
                user.password = newPassword ? newPassword : password

                return user.save()
            })
            .then(() => true)
    },

    /**
      * Delete a user from the server, using the id to identify and email and password as a credentials
      * 
      * @param {string} id user id
      * @param {string} email user email
      * @param {string} password password of the user
      * 
      * @returns {Promise<boolean>} True, if the changes are applied
      */
    unregisterUser(id, email, password) {
        return Promise.resolve()
            .then(() => {
                if (typeof id !== 'string') throw Error('user id is not a string')

                if (!(id = id.trim()).length) throw Error('user id is empty or blank')

                if (typeof email !== 'string') throw Error('user email is not a string')

                if (!(email = email.trim()).length) throw Error('user email is empty or blank')

                if (typeof password !== 'string') throw Error('user password is not a string')

                if ((password = password.trim()).length === 0) throw Error('user password is empty or blank')

                return User.findOne({ email, password })
            })
            .then(user => {
                if (!user) throw Error('wrong credentials')

                if (user.id !== id) throw Error(`no user found with id ${id} for given credentials`)

                return user.remove()
            })
            .then(() => true)
    },

    /**
     * Creates a group and includes the creator user as a admin 
     * 
     * @param {string} userId The userID that creates the group
     * @param {string} name Group name
     * 
     * @returns {Promise<string>} group ID
     */
    createGroup(userId, name) {
        return Promise.resolve()
            .then(() => {
                if (typeof userId !== 'string') throw Error('user id is not a string')

                if (!(userId = userId.trim()).length) throw Error('user id is empty or blank')

                if (typeof name !== 'string') throw Error('group name is not a string')

                if (!(name = name.trim()).length) throw Error('group name is empty or blank')

                return Group.create({ name, users: [ObjectId(userId)] })
                    .then(res => res._doc._id.toString())
            })
    },

    /**
     * List groups by user
     * 
    * @param {string} userId The user id
    * 
    * @throws {Error} If the user does not belong to any group
    * 
    * @returns {Promise<[group]>} The complete group information
    */
    listGroupsByUser(userId) {
        return Promise.resolve()
            .then(() => {
                if (typeof userId !== 'string') throw Error('user id is not a string')

                if (!(userId = userId.trim()).length) throw Error('user id is empty or blank')

                return Group.find({ users: userId })
                    .then(groups => {
                        if (!groups) throw Error(`no user found with id ${userId}`)

                        return groups
                    })
            })
    },
    /**
        * List users by group
        * 
       * @param {string} userId The user id
       * @param {string} groupId The group id
       * 
       * @throws {Error} If the user does not belong to any group
       * 
       * @returns {Promise<[group]>} The complete group information
       */
    listUsers(userId, groupId) {
        return Promise.resolve()
            .then(() => {
                if (typeof groupId !== 'string') throw Error('group id is not a string')

                if (!(groupId = groupId.trim()).length) throw Error('group id is empty or blank')

                return Group.findById({ _id: groupId }).populate('users')
                    .then(users => {
                        if (!users) throw Error(`no group found with id ${groupId}`)

                        return users
                    })
            })
    },
    /**
    * Add a existing User to the current Group
    * 
    * @param {string} userId A user that already belongs to the group and invites a new user by its email
    * @param {string} groupId The Id of the Group
    * @param {string} email The including user email 
    * 
    * @throws {Error} If the Group does not exist
    * 
    * @returns {Promise<string>} All the users inside the group
    */
    addUserToGroup(userId, groupId, email) {
        return Promise.resolve()
            .then(() => {
                if (typeof groupId !== 'string') throw Error('group id is not a string')

                if (!(groupId = groupId.trim()).length) throw Error('group id is empty or blank')

                if (typeof email !== 'string') throw Error('user email is not a string')

                if (!(email = email.trim()).length) throw Error('user email is empty or blank')

                return User.findById(userId)
                    .then(user => {
                        if (!user) throw Error(`no user found with id ${userId}`)

                        return User.findOne({ email })
                            .then(user => {
                                return Group.findById(groupId)
                                    .then(group => {
                                        if (!group) throw Error(`no group found with id ${groupId}`)

                                        if (!group.users.some(_userId => _userId.toString() === userId)) throw Error(`user with id ${userId} does not belong to group with id ${groupId}`)

                                        if (group.users.some(_userId => _userId.toString() === user._id.toString())) throw Error(`user with id ${userId} does already belong to group with id ${groupId}`)

                                        return true
                                    })
                                    .then(_group => {
                                        return Group.findByIdAndUpdate(groupId, { $push: { users: user._id } })
                                            .then(_group => {
                                                return true
                                            })
                                    })
                            })
                    })
            })
    },

    /**
        * Add a Spend to the group, you must select the payer and the fractions of every user that participates
        * 
        * @param {string} groupId the id of the group you want to add the spend
        * @param {Number} amount the total amount of the spend
        * @param {string} payerId of the user who pays the most quantity
        * @param {[{user: string, fraction: Number}]} fractions this has user as the participate and fraction if he made any apportation at the total value
        * 
        * @returns {Promise<string>}
        */
    addSpend(userId, groupId, amount, name, payerId, fractions) {
        return Promise.resolve()
            .then(() => {
                if (typeof userId !== 'string') throw Error('user id is not a string')

                if (!(userId = userId.trim()).length) throw Error('user id is empty or blank')

                if (typeof groupId !== 'string') throw Error('group id is not a string')

                if (typeof name !== 'string') throw Error('spend name is not a string')

                if (!(name = name.trim()).length) throw Error('spend name is empty or blank')

                if (!(groupId = groupId.trim()).length) throw Error('group id is empty or blank')

                if (typeof payerId !== 'string') throw Error('user id is not a string')

                if (!(payerId = payerId.trim()).length) throw Error('user id is empty or blank')

                if (!(fractions instanceof Array)) throw Error('fractions is not an array')

                if (typeof amount !== 'number') throw Error('amount is not a number')

                const fractionsTotal = fractions.reduce((accum, fraction) => accum + fraction.amount, 0)

                if (amount !== fractionsTotal) throw Error('amount is not equal to the sum of fractions')

                const userIds = [payerId]

                const promises = [User.findById(payerId)]

                fractions.forEach(fraction => {
                    userIds.push(fraction.user)

                    promises.push(User.findById(fraction.user))
                })

                return Promise.all(promises)
                    .then(users => {
                        users.forEach((user, index) => {
                            if (!user) throw Error(`no user found with id ${userIds[index]}`)
                        })

                        return Group.findById(groupId).populate('users')
                            .then(group => {
                                if (!group) throw Error(`no group found with id ${group}`)

                                if (!group.users.some(_userId => _userId._id.toString() === userId)) throw Error(`user with id ${userId} does not belong to group with id ${groupId}`)

                                group.spends.push(new Spend({
                                    user: userId,
                                    amount,
                                    name,
                                    payer: payerId,
                                    fractions
                                }))

                                return group.save()
                            })
                            .then(() => true)
                    })
            })
    },

    /**
     * List all the spends that are assigned to a group
     * 
    * @param {string} groupId the id of the group 
    * 
    * @returns {Promise<[Spend]>} all the information of the spend
    */
    listSpends(userId, groupId) {
        return Promise.resolve()
            .then(() => {
                if (typeof userId !== 'string') throw Error('group id is not a string')

                if (!(userId = userId.trim()).length) throw Error('group id is empty or blank')

                if (typeof groupId !== 'string') throw Error('group id is not a string')

                if (!(groupId = groupId.trim()).length) throw Error('group id is empty or blank')

                return Group.findById(groupId).populate({
                    path: 'spends.fractions.user'
                })
                    .then(group => {
                        if (!group) throw Error(`no group found with id ${groupId}`)

                        if (!group.users.some(_userId => _userId._id.toString() === userId)) throw Error(`user with id ${userId} does not belong to group with id ${groupId}`)

                        return group.spends.map(({ id, amount, name, date, payer, fractions }) => {
                            const _fractions = fractions.map(({ user, amount }) => ({ userId: user, amount }))

                            let payerName;

                            _fractions.forEach(({ userId }, i) => {
                                if (userId._id.toString() === payer.toString()) {
                                    payerName = userId.name
                                }
                            })

                            return { id, amount, name, date, payerId: payer.toString(), payerName, fractions: _fractions }
                        })
                    })
            })
    },


    /**
     * Calculate the creditor and the debtor of the group, takes all the spends and asign for each one a fraction with the users that owes to other users
     * 
     * @param {string} userId the user id, to be assure is a real member
     * @param {string} groupId the group id that has the spends on it
     * 
     * @return {Array} an array of objects with the creditor and the debtor and all the spends
     *
     */
    calculateDebts(userId, groupId) {
        return Promise.resolve()
            .then(() => {
                if (typeof groupId !== 'string') throw Error('group id is not a string')

                if (!(groupId = groupId.trim()).length) throw Error('group id is empty or blank')

                if (typeof userId !== 'string') throw Error('group id is not a string')

                if (!(userId = userId.trim()).length) throw Error('group id is empty or blank')

                return Group.findById(groupId)
                    .then(groupData => {
                        const debts = groupData.spends.reduce((debtors, spend) => {
                            const payerId = spend.payer.toString();

                            spend.fractions.forEach(fraction => {
                                const userId = fraction.user.toString();

                                if (userId !== payerId) {
                                    const debtor = debtors.find(debtor => debtor.userId === userId) || (userId => {
                                        const debtor = { userId, debts: [] };

                                        debtors.push(debtor);

                                        return debtor
                                    })(userId)

                                    const creditor = debtor.debts.find(debt => debt.userId === payerId) || (userId => {
                                        const creditor = { userId, amount: 0 };

                                        debtor.debts.push(creditor);

                                        return creditor
                                    })(payerId)

                                    creditor.amount += fraction.amount
                                }
                            })
                            return debtors
                        }, [])

                        return debts
                    })
            })
    },

    /**
     * Uses calculateSpends to give all the information and treat it, just take the amount and returns how much do every member of the spends of the group, owes to the other members
     * 
     * @param {string} userId 
     * @param {string} groupId 
     * 
     * @returns {Array} returns balance as the final information of who debts to whom
     */
    splitSpends(userId, groupId) {
        return this.calculateDebts(userId, groupId)
            .then(debts => {
                const balance = debts.reduce((balance, userDebt) => {
                    userDebt.debts.forEach(debtTo => {
                        if (!balance.some(item => item.userId === debtTo.userId && item.debtorId === userDebt.userId)) {
                            const userDebtTo = debts.find(debt => debt.userId === debtTo.userId);

                            const debtToMe = userDebtTo.debts.find(debt => debt.userId === userDebt.userId);

                            if (debtToMe)
                                if (debtTo.amount > debtToMe.amount)
                                    balance.push({ creditorId: debtTo.userId, creditorName: '', debtorId: userDebt.userId, debtorName: '', amount: debtTo.amount - debtToMe.amount })
                        }
                    })
                    return balance
                }, [])

                return balance
            })
            .then(balance => {
                return Promise.all(balance.map(async (users, index) => {
                    const res = await User.findById(users.creditorId)
                        .then(user => {
                            balance[index].creditorName = user.name

                            return balance[index]
                        })

                    return res
                }))
            })
            .then(balance => {
                return Promise.all(balance.map(async (users, index) => {
                    const res = await User.findById(users.debtorId)
                        .then(user => {
                            balance[index].debtorName = user.name

                            return balance[index]
                        })
                    return res
                }))
            })
    }
}

module.exports = logic