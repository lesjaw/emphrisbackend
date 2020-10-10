"use strict";

var rethinkdb = require('rethinkdb');
var db = require('./db');
var async = require('async');
var dbmodel = new db();

class descriptors {

    async addNewUsers(userData, callback) {
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
                rethinkdb.table('descriptors').insert(userData).run(connection, function (err, result) {
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
                rethinkdb.table('descriptors').get(userData.label).run(connection, function (err, result) {
                    if (err) {
                        return callback(true, "Error fetching users to database");
                    }

                    rethinkdb.table('descriptors').get(userData.id).update(userData).run(connection, function (err, result) {
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
                rethinkdb.table('descriptors').pluck("descriptors", "label").run(connection, function (err, cursor) {
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
                rethinkdb.table('descriptors').pluck("descriptors", "label").get(userData.label).run(connection, function (err, result) {
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
                async function (connection, callback) {

                    // let resultLooping = {};
                    // resultLooping = [];

                    for (const val of userData) {
                        await rethinkdb.table('descriptors').filter({
                            label: val.label
                        }).run(connection, function (err, cursor) {
                            if (err) {
                                return callback(true, "Error fetching users to database");
                            }
                            cursor.toArray(function (err, result) {
                                if (err) {
                                    return callback(true, "Error reading cursor");
                                }
                                // console.log(result)
                                if (result.length > 0) {
                                    if (result) {
                                        rethinkdb.table('descriptors').get(result[0].id).update(val).run(connection, function (err, result) {
                                            if (err) {
                                                // return callback(true, "Error happens while adding new user");
                                            }
                                            connection.close();
                                            resultLooping.push(result);
                                        });
                                    } else {
                                        rethinkdb.table('descriptors').insert(val).run(connection, function (err, result) {
                                            connection.close();
                                            if (err) {
                                                // return callback(true, "Error happens while adding new user");
                                            }
                                            resultLooping.push(result);
                                        });
                                    }
                                } else {
                                    rethinkdb.table('descriptors').insert(val).run(connection, function (err, result) {
                                        connection.close();
                                        if (err) {
                                            // return callback(true, "Error happens while adding new user");
                                        }
                                        resultLooping.push(result);
                                    });
                                }

                            });
                        });
                    }
                    connection.close();
                    // console.log('loo', resultLooping);
                    // callback(null, resultLooping);
                }
            ],

            function (err, data) {
                console.log(err, data)
                callback(err === null ? false : true, data);
            });
    }
}

module.exports = descriptors;