const roles = [ "guest", "user", "admin" ]

module.exports = {
    roles,
    getLevel(rolename) {
        return roles.indexOf(rolename)
    }
}
