"use strict";

var rethinkdb = require('rethinkdb');
var db = require('./db');
var async = require('async');
var dbmodel = new db();
var bcrypt = require('bcryptjs');

class users {

    async addNewUsers(userData, callback) {
        let pass = await bcrypt.hash(userData.password, 10);

        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },

            function (connection, callback) {
                rethinkdb.table('users').insert({
                    "name": userData.name,
                    "id": userData.email,
                    "email": userData.email,
                    "password": pass,
                    "biodata": userData.biodata
                }).run(connection, function (err, result) {
                    connection.close();
                    if (err) {
                        return callback(true, "Error happens while adding new user");
                    }
                    callback(null, result);
                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }

    updateUser(userData, callback) {

        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },
            function (connection, callback) {
                rethinkdb.table('users').get(userData.id).run(connection, function (err, result) {
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }

                    rethinkdb.table('users').get(userData.id).update(userData).run(connection, function (err, result) {
                        connection.close();
                        if (err) {
                            return callback(true, "Error updating users");
                        }
                        callback(null, result);
                    });
                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }

    getAllUsers(callback) {
        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },
            function (connection, callback) {
                rethinkdb.table('users').pluck("biodata", "email", "id", "name", "status").run(connection, function (err, cursor) {
                    connection.close();
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }
                    cursor.toArray(function (err, result) {
                        if (err) {
                            return callback(true, "Error reading cursor");
                        }
                        callback(null, result);
                    });
                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }

    getAUser(userData, callback) {
        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },
            function (connection, callback) {
                rethinkdb.table('users').get(userData.id).run(connection, function (err, result) {
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }
                    console.log(result)
                    if (result) {
                        if (result.id) {
                            callback(null, result);
                        } else {

                        }
                    } else {
                        callback(null, 0);
                    }
                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }

    checkUser(userData, callback) {
        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },
            function (connection, callback) {
                rethinkdb.table('users').get(userData.id).run(connection, function (err, result) {
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }
                    console.log(result)
                    if (result) {
                        if (result.id) {
                            callback(null, 1);
                        } else {

                        }
                    } else {
                        callback(null, 0);
                    }
                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }

    login(userData, callback) {
        async.waterfall([
            function (callback) {
                dbmodel.connectToDb(function (err, connection) {
                    if (err) {
                        return callback(true, "Error connecting to database");
                    }
                    callback(null, connection);
                });
            },
            function (connection, callback) {
                rethinkdb.table('users').get(userData.id).run(connection, function (err, result) {
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }
                    console.log(result)
                    if (result) {
                        let pass1 = result.password;
                        let pass2 = userData.password
                        const correctPW = bcrypt.compareSync(pass2, pass1);
                        callback(null, correctPW);
                    } else {
                        callback(null, "No User: " + userData.id);
                    }

                });
            }
        ], function (err, data) {
            callback(err === null ? false : true, data);
        });
    }
}

module.exports = users;