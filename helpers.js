const getUserByEmail = function(email, database) {
    let foundUser = null;

    for (const userId in database) {
        const user = database[userId];
        if (user.email === email) {
            foundUser = user;
        }
    }
    return foundUser;
};

module.exports = {getUserByEmail};