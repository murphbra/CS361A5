//Author: Brayden Murphy
//CS 361 Assignment 7 


const express = require('express');
const app = express();
const path = require('path'); 
const cors = require('cors'); 
const {Datastore} = require('@google-cloud/datastore');
var bodyParser = require('body-parser');
const datastore = new Datastore();
const EVENT = "Event"; 
const router = express.Router();
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
app.use(express.json()); 
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(cors()); 
app.set('view engine', '.hbs'); 



/* ------------- Begin Lodging Model Functions ------------- */

/**
 * 
 */

function post_event(title, description, date, invites) {
    var key = datastore.key(EVENT);
    var invitesArr = invites.split(','); 
    for(var x=0; x<invitesArr.length; x++)
    {
        var emailObject = {}; 
        emailObject.name = invitesArr[x]; 
        emailObject.response = "No response"; 
        invitesArr[x] = emailObject; 
    }; 
    const new_event = {"title": title, "description": description, "date": date, "invites": invites, "emails": invitesArr}; 
    return datastore.save({"key": key, "data": new_event}); 
}

function get_events(context) {
    const q = datastore.createQuery(EVENT);
    return datastore.runQuery(q).then((entities) => {
        results = entities[0].map(fromDatastore); 
        context.events = results; 
        return context; 
    });
}

function get_event(id) {
    const key = datastore.key([EVENT, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            return entity;
        } else {
            return entity.map(fromDatastore);
        }
    });
}

function delete_event(id) {
    const key = datastore.key([EVENT, parseInt(id, 10)]);
    return datastore.delete(key); 
}
/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

router.get('/', function(req, res){
    res.render("index"); 
}); 

router.get('/error', function(req, res){
    res.render("error"); 
})

router.get('/events', function(req, res){
    var context = {};  
    get_events(context).then((context) =>{ 
        res.render("events", context);
    }); 
}); 

router.get('/event/:event_id', function(req, res){
    var context = {}; 
    get_event(req.params.event_id).then( (event) => {
        context.data = event[0]; 
        res.render("event", context); 
    }); 
}); 

router.get('/event/:event_id/rsvp/:email_name', function(req, res) {
    var context = {}; 
    get_event(req.params.event_id).then((event)=> {
        context.event = event[0]; 
        context.email = req.params.email_name; 
        res.render("rsvp", context); 
    }); 
}); 

router.post('/event/:event_id/rsvp/:email_name', function(req, res) {
    //get_event(req.params.event_id).then((event)=> {  
    //}); 
    if(req.body.respond === undefined)
    {
        res.redirect('/error'); 
    }
    else if (req.body.respond === 'accept')
    {
        res.redirect('/accept'); 
    }
    else if (req.body.respond === 'decline')
    {
        res.redirect('/decline'); 
    }
}); 

router.post('/', function(req, res){
    if(req.body.title === undefined)
    {
        res.redirect('/error'); 
    }
    else {
        post_event(req.body.title, req.body.description, req.body.date, req.body.invites); 
        res.redirect('/'); 
    }
}); 

router.delete('/events/:event_id', function(req, res){
    delete_event(req.params.event_id); 
    res.redirect('/events'); 
})
/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
//const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});