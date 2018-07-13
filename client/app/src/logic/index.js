const api = require('api')

api.url = 'http://localhost:5000/api'
// api.url = 'https://warm-taiga-86266.herokuapp.com/api'

const logic = {
    userId: 'NO-ID',

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
        return api.registerUser(name, surname, email, password)
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
    loginUser(email, password) {
        return api.authenticateUser(email, password)
            .then(id => {
                this.userId = id.toString()

                return true
            })
    },

    /**
   * retrieve user information
   * 
   * @param {string} userId user id
   * 
   * @throws {Error} if the user does not exist
   * 
   * @returns {Promise<string>} the user data
   * 
   */
    retrieveUser(userId) {
        return api.retrieveUser(userId)
            .then(user => {
                return user
            })
    },

    /**
 * Creates a group and includes the creator user as a admin 
 * 
 * @param {string} userId The userID that creates the group
 * @param {string} name Group name
 * 
 * @returns {Promise<string>} group ID
 */
    createGroup(name) {
        return api.createGroup(this.userId, name)
            .then(() => true)
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
    listGroups() {
        return api.listGroupsByUser(this.userId)
            .then(groups => {
                console.log(groups)
                return groups
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
    addUserToGroup(groupId, email) {
        return api.addUserToGroup(this.userId, groupId, email)
            .then(user => {
                console.log(user)
                return user
            })
    },

    /**
            * Add a Spend to the group, you must select the payer and the fractions of every user that participates
            * 
            * @param {string} groupId the id of the group you want to add the spend
            * @param {Number} amount the total amount of the spend
            * @param {string} spendName is the name of the spending
            * @param {string} payerId of the user who pays the most quantity
            * @param {[{user: string, fraction: Number}]} fractions this has user as the participate and fraction if he made any apportation at the total value
            * 
     */
    addSpend(groupId, amount, spendName, payerId, fractions) {
        return api.addSpend(this.userId, groupId, amount, spendName, payerId, fractions)
            .then(spend => {
                console.log(spend)
                return spend
            })
    },

    /**
     * List users by group
     * 
     * @param {string} group the user group id
     */
    listUsers(group) {
        return api.listUsers(this.userId, group)
            .then(users => {
                console.log(users)
                return users
            })
    },
    /**
     * List all the spends that are assigned to a group
     * @param {string} group the user group id
     */
    listSpends(group) {
        return api.listSpends(this.userId, group)
            .then(spends => {
                console.log(spends)
                return spends
            })
    },

    /**
     * take the amount and returns how much do every member of the spends of the group, owes to the other member
     * 
     * @param {string} group the user group id
     */
    splitSpends(group) {
        return api.splitSpends(this.userId, group)
            .then(balance => {
                return balance
            })
    },

    /**
     * check if the user is already logged in or not
     *
     */
    get loggedIn() {
        if (this.userId !== 'NO-ID' && this.userId !== null && this.userId !== undefined && sessionStorage.getItem('userId')) return true
    },

    /**
 * Logs a user out
 * 
 * @param {string} username - The user's username
 * @param {string} password - The user's password
 * 
 * @returns {boolean} - Confirms log-out 
 */
    logout() {
        sessionStorage.clear()

        return true
    }

}

module.exports = logic