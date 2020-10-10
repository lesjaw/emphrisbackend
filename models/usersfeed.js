var rethinkdb = require('rethinkdb');
var db = require('./db');
var userObject = new db();
var runStream = false;
var runChange = false
module.exports = function (socket) {

    socket.on('message', (msg) => {
        console.log(msg);
        socket.broadcast.emit('message-broadcast', msg);
    });

    socket.on('disconnect', (msg) => {
        console.log('user disconnected' + msg);
    });

    socket.on('userOpenApp', data => {
        // userObject1.updateUser(data, function (err, response) {});
        console.log("updateUser");
        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('users').get(data.id).run(connection, function (err, result) {
                rethinkdb.table('users').get(data.id).update(data).run(connection, function (err, result) {
                    connection.close();
                });
            });
        });
    });

    socket.on('panic_button_get', data => {
        // console.log(data)
        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('panic_button_log').filter(
                function (rec) {
                    return rec('user').match(data.get);
                }
            ).orderBy(rethinkdb.desc('timestamps')).limit(10).run(connection, function (err, cursor) {
                cursor.toArray(function (err, resultori) {
                    // console.log(result)
                    let arrayResult = [];
                    arrayResult = resultori;
                    const result = [...resultori].reverse();
                    // console.log(reversedList)

                    if (err) {
                        socket.emit("panic_button_get" + data.user, {
                            err
                        });
                    }
                    socket.emit("panic_button_get" + data.user, {
                        result
                    });
                });
            });
        });
    });

    // socket.on('panic_button_change', data => {
    //     // console.log(data)
    //     // if (!runChange) {
    //     //     runChange = true;
    //         userObject.connectToDb(function (err, connection) {
    //             rethinkdb.table('panic_button_log').filter(
    //                 function (rec) {
    //                     return rec('user').match(data.get);
    //                 }
    //             ).changes().run(connection, function (err, cursor) {
    //                 cursor.each(function (err, row) {
    //                     socket.emit("panic_button_log" + data.user, {
    //                         new: row.new_val,
    //                         old: row.old_val
    //                     });
    //                 });
    //             });
    //         });
    //     // }
    // });

    socket.on('panic_button_del', data => {
        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('panic_button_log').filter(data).delete().run(connection, function (err, cursor) {
                socket.emit("panic_button_get" + data.user, {
                    cursor
                });
            })
        });
    });

    socket.on('panic_button_user_set', data => {
        userObject.connectToDb(function (err, connection) {
            // console.log('data', data)
            // console.log('id subs', data.subscribe[0])
            rethinkdb.table('pb_users').get(data.id).run(connection, function (err, cursor) {
                // console.log(cursor)
                if (cursor == null) {
                    rethinkdb.table('pb_users').insert(data).run(connection, function (err, cursor) {});
                } else {
                    // console.log('result sub', data.subscribe[0]);
                    const value = data.subscribe[0];
                    const isInArray = cursor.subscribe.includes(value);
                    // console.log(isInArray); // true
                    if (!isInArray) {
                        rethinkdb.table('pb_users').get(data.id).update(function (doc) {
                            // console.log(doc)
                            return {
                                subscribe: doc('subscribe').union(data["subscribe"])
                            }
                        }).run(connection, function (err, cursor) {
                            // console.log(cursor)
                        });
                    }
                }
            });
        });
    });

    socket.on('pb_users_get', data => {
        console.log(data)
        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('pb_users').getAll(data.id).run(connection, function (err, cursor) {
                if (cursor != undefined) {
                    cursor.toArray(function (err, result) {
                        // console.log(result)
                        if (err) {
                            socket.emit("pb_users_get" + data.id, {
                                err
                            });
                        }
                        socket.emit("pb_users_get" + data.id, {
                            result
                        });
                    });
                }

            });
        });
    });

    socket.on('pb_users_del', data => {
        console.log(data)
        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('pb_users').get(data.id).update({
                subscribe: rethinkdb.row('subscribe')
                    .difference([data.sub])
            }).run(connection, function (err, cursor) {
                // socket.emit("panic_button_get" + data.user, {
                //     cursor
                // });
            })
        });

        //     r.db('emphris').table('pb_users').filter({'id':'b5c93fb6-3af5-45e4-a4a3-9a13dcebccda'}).update({subscribe: r.row('subscribe')
        // .difference(["c2909a90f4a57963"])});
    });

    if (!runStream) {
        runStream = true;

        userObject.connectToDb(function (err, connection) {
            console.log("callStream?");

            rethinkdb.table('users').pluck("biodata", "email", "id", "name", "status").changes().run(connection, function (err, cursor) {
                cursor.each(function (err, row) {
                    // console.log("userFeed", row.new_val.id);
                    socket.broadcast.emit("userChange", {
                        new: row.new_val,
                        old: row.old_val
                    });
                });
            });

            rethinkdb.table('descriptors').pluck("descriptors", "label").changes().run(connection, function (err, cursor) {
                cursor.each((err, row) => {
                    socket.broadcast.emit("descriptorsFeed", {
                        new: row.new_val,
                        old: row.old_val
                    }); // publish row to the frontend
                });
            });

            rethinkdb.table('panic_button_log').changes().run(connection, function (err, cursor) {
                cursor.each(function (err, row) {
                    console.log("pbLog", row.new_val);
                    if (row.new_val) {
                        socket.broadcast.emit("panic_button_log" + row.new_val.user, {
                            new: row.new_val,
                            old: row.old_val
                        });
                    }
                });
            });

        });

    }


}