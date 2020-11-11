var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://cloud.olmatix.com', {
    // var client = mqtt.connect('mqtt://broker.emqx.io', {
    will: {
        topic: '/test/online',
        payload: 'false',
        qos: 1,
        retain: true
    }
})
var request = require('request');

var options = {
    qos: 1,
    retain: true
}

var rethinkdb = require('rethinkdb');
var db = require('./models/db');
var userObject = new db();


client.on('connect', function () {
    console.log('MQTT connected');
    client.subscribe('/test/status', options, function (err) {
        if (!err) {
            client.publish('/test/online', 'true', options);
        }
    })
})

client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());

    //data0 = app id
    //data1 = boxTitle
    //data2 = kordinat
    const data = message.toString().split(';');

    console.log(data)

    let kord;
    if (data.length < 3) {
        kord = "0,0"
    } else {
        kord = data[2]
    }


    if (data[0] != undefined && data[1] != undefined) {
        const panic = {
            user: data[0],
            description: data[1],
            kordinat: kord,
            timestamps: new Date(),
        }

        userObject.connectToDb(function (err, connection) {
            rethinkdb.table('panic_button_log').insert(panic).run(connection, function (err, result) {});
        });

        const dataNotif = {
            android: {
                notification: {
                    defaultSound: true,
                    notificationCount: 1,
                    sound: 'ambulance.mp3',
                    channelId: 'pb'
                },
                ttl: 20000
            },
            notification: {
                title: "Panic! " + data[0],
                body: "Warning Button Panic Box " + data[1] + " pressed!",
                icon: "https://apps.olmatix.com:3000/assets/panic.png",
                image: "https://apps.olmatix.com:3000/assets/panic.png",
                sound: "ambulance.mp3",
                channelId: 'pb',
                android_channel_id: "pb"

            },
            data: {
                for: 1
            },
            to: "/topics/" + data[0]
        }

        // if (data[0] !== "PENCET" || data[0] !== "LEPAS") {

        client.publish('/test/status/' + data[0], JSON.stringify(dataNotif));

        console.log(data[2]);

        if (data[2] === "Online") {
            var options = {
                'method': 'POST',
                'url': 'https://fcm.googleapis.com/fcm/send',
                'headers': {
                    'Authorization': 'key=AAAAlGx2GxQ:APA91bFPiVXg03EivamHnirXpKrBSAnh5dRd50Ufh2SI-MMA_YswGsSSttQRq3LUnRn8HWBqCvKESe_yS_p9zQ0dSAM18n3ppCKY_sF68s2HEzAJXkBf08ISk81hHTrBzwg1lMtnWHpB',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "notification": {
                        "title": "Panic! " + data[1],
                        "body": "Awesome Button Panic Box back " + data[2],
                        "icon": "https://apps.olmatix.com:3000/assets/panic.png",
                        "image": "https://apps.olmatix.com:3000/assets/panic.png",
                        "sound": "default",
                        "channelId": 'device',
                        "android_channel_id": "device"
                    },
                    "data": {
                        "for": "admin"
                    },
                    "to": "/topics/" + data[0]
                })
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
            });

        } else if (data[2] === "Offline") {
            var options = {
                'method': 'POST',
                'url': 'https://fcm.googleapis.com/fcm/send',
                'headers': {
                    'Authorization': 'key=AAAAlGx2GxQ:APA91bFPiVXg03EivamHnirXpKrBSAnh5dRd50Ufh2SI-MMA_YswGsSSttQRq3LUnRn8HWBqCvKESe_yS_p9zQ0dSAM18n3ppCKY_sF68s2HEzAJXkBf08ISk81hHTrBzwg1lMtnWHpB',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "notification": {
                        "title": "Panic! " + data[1],
                        "body": "Warning Button Panic Box is " + data[2],
                        "icon": "https://apps.olmatix.com:3000/assets/panic.png",
                        "image": "https://apps.olmatix.com:3000/assets/panic.png",
                        "sound": "default",
                        "channelId": 'device',
                        "android_channel_id": "device"
                    },
                    "data": {
                        "for": "admin"
                    },
                    "to": "/topics/" + data[0]
                })
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
            });

        } else {
            var options = {
                'method': 'POST',
                'url': 'https://fcm.googleapis.com/fcm/send',
                'headers': {
                    'Authorization': 'key=AAAAlGx2GxQ:APA91bFPiVXg03EivamHnirXpKrBSAnh5dRd50Ufh2SI-MMA_YswGsSSttQRq3LUnRn8HWBqCvKESe_yS_p9zQ0dSAM18n3ppCKY_sF68s2HEzAJXkBf08ISk81hHTrBzwg1lMtnWHpB',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "notification": {
                        "title": "Panic! " + data[1],
                        "body": "Warning Button Panic Box " + data[1] + " pressed!",
                        "icon": "https://apps.olmatix.com:3000/assets/panic.png",
                        "image": "https://apps.olmatix.com:3000/assets/panic.png",
                        "sound": "ambulance.mp3",
                        "channelId": 'panicbutton',
                        "android_channel_id": "panicbutton"
                    },
                    "data": {
                        "for": "admin"
                    },
                    "to": "/topics/" + data[0]
                })
            };
            request(options, function (error, response) {
                if (error) throw new Error(error);
                console.log(response.body);
            });
        }

        // var options = {
        //     'method': 'POST',
        //     'url': 'https://fcm.googleapis.com/fcm/send',
        //     'headers': {
        //         'Authorization': 'key=AAAAlGx2GxQ:APA91bFPiVXg03EivamHnirXpKrBSAnh5dRd50Ufh2SI-MMA_YswGsSSttQRq3LUnRn8HWBqCvKESe_yS_p9zQ0dSAM18n3ppCKY_sF68s2HEzAJXkBf08ISk81hHTrBzwg1lMtnWHpB',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         "notification": {
        //             "title": "Panic! " + data[1],
        //             "body": "Warning Button Panic Box " + data[1] + " pressed!",
        //             "icon": "https://apps.olmatix.com:3000/assets/panic.png",
        //             "image": "https://apps.olmatix.com:3000/assets/panic.png",
        //             "sound": "ambulance.mp3",
        //             "channelId": 'pb',
        //             "android_channel_id": "pb"
        //         },
        //         "data": {
        //             "for": "admin"
        //         },
        //         "to": "/topics/" + data[0]
        //     })
        // };
        // request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        // });
        // }
    }



})