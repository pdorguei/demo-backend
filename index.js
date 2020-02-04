const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const dbConnectionUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/sampledb';
const dbName = process.env.MONGODB_DBNAME || 'sampledb';
const mongo = require('mongodb').MongoClient;
const myIp = (require('os').networkInterfaces())['eth0'][0]['address'];


app.get('/ticket', function(req, res, next) {
    let newTicketNumber = 125391;    
    mongo.connect(dbConnectionUrl, (err, client) => {
	if (err) {
	    console.error(err);
	    res.send({success: false, result: 1, order: '', ip: myIp});
	} else {
	    const db = client.db(dbName);
	    const collection = db.collection('requetes');
	    collection.find({}).count().then((n) => {
		if (n > 0) {
		    collection.find().sort({ticketNumber:-1}).limit(1).toArray((err, items) => {
			let highestTicket = items[0].ticketNumber;
			newTicketNumber = highestTicket + 1;
			collection.insertOne({ticketNumber: newTicketNumber, order: req.query, ip: myIp}, (err, result) => {
			    console.log('err:' + err, ' result: ' + result);
			});
			res.send({success: true, result: newTicketNumber, order: req.query, ip: myIp});
		    }); 
		} else {
		    collection.insertOne({ticketNumber: newTicketNumber, order: req.query}, (err, result) => {
			console.log('err:' + err, ' result: ' + result);
		    });
		    res.send({success: true, result: newTicketNumber, order: req.query, ip: myIp});
		}
	    }).catch((err) => {
		console.log(err);
		res.send({success: false, result: 2, order: req.query, ip: myIp});
	    });
	} 		
    });	
});

/* for debugging purposes */
app.get('/requetes', function (req, res, next) {
    var ordersList;
    
    mongo.connect(dbConnectionUrl, (err, client) => {
	if (err) {
	    console.error(err)
	    return
	}
	console.log(dbConnectionUrl);
	const db = client.db(dbName);
	const collection = db.collection('orders');
	collection.find().toArray((err, items) => {
	    ordersList = items;
	    console.log(items);
	});
    })
    console.log(ordersList);		
    res.send({success: true, result: ordersList, order: req.query, ip: myIp});
    
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({success: false, result: 'Ca coince", order: req.query, ip: myIp});
});

app.listen(port, host);
console.log('Démarré sur ' + host + ':' + port);
