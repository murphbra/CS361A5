//Author: Brayden Murphy
//CS 361 Assignment 7 


const express = require('express');
const app = express();

const {Datastore} = require('@google-cloud/datastore');
const bodyParser = require('body-parser');
const datastore = new Datastore();
const EVENT = "Event"; 
const router = express.Router();
app.use(bodyParser.json());
const PORT = process.env.PORT || 8080;
function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}
app.set('trust proxy', true);

var exphbs = require('express-handlebars');
app.engine('.hbs', exphbs({                     
    extname: ".hbs"
}));
app.set('view engine', '.hbs'); 


/* ------------- Begin Lodging Model Functions ------------- */

/**
 * 
 */

function post_event(title, description, date, invites) {
    var key = datastore.key(EVENT);
    const new_event = {"title": title, "description": description, "date": date, "invites": invites}; 
    return datastore.save({"key": key, "data": new_event}); 
}

function get_events(context) {
    const q = datastore.createQuery(EVENT);
    return datastore.runQuery(q).then((entities) => {
        results = entities[0].map(fromDatastore); 
        context.events = Object.keys(results); 
        return context; 
    });
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

router.get('/', function(req, res){
    res.render("index"); 
}); 

router.get('/events', function(req, res){
    var context = {};  
    get_events(context).then((context) =>{ 
        res.render("events", context);
    }); 
}); 

router.post('/', function(req, res){
    post_event(req.body.title, req.body.description, req.body.date, req.body.invites); 
    res.redirect('/'); 
}); 

/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
//const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});