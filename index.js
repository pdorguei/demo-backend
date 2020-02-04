const express = require('express');
const app = express();
const host = process.env.IP  || '0.0.0.0';
const port = process.env.PORT || 8080;
const dbConnectionUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/sampledb';
const dbName = process.env.MONGODB_DBNAME || 'sampledb';
const mongo = require('mongodb').MongoClient;

app.get('/ticket', function(req, res, next) {
    let newTicketNumber = 125391;
	console.log('avant myip')
    let myIp = self.location.origin;
	console.log(myIp)
    mongo.connect(dbConnectionUrl, (err, client) => {
	if (err) {
	    console.error(err);
	    res.send({success: false, result: 9999});
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
		res.send({success: false, result: 999});
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
    res.send({success: true, result: ordersList});
    
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Ca coince.');
});

app.listen(port, host);
console.log('Démarré sur ' + host + ':' + port);
