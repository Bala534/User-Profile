var express=require("express");
var app=express();
const session = require('express-session');
var sess = require('sess')
var path = require('path');
const bcrypt = require('bcrypt')
const methodOverride = require("method-override");
app.use(express.static("public"));
var bodyParser=require("body-parser");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(methodOverride("_method"));

// Session Setup
app.use(session({
    secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true
}))

var sess;

function authentication(req, res, next) {
    var authheader = req.headers.authorization;
    console.log(req.headers);
 
    if (!authheader) {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err)
    }
 
    var auth = new Buffer.from(authheader.split(' ')[1],
    'base64').toString().split(':');
    var user = auth[0];
    var pass = auth[1];
 
    if (user == 'admin' && pass == 'app') {
 
        // If Authorized user
        next();
    } else {
        var err = new Error('You are not authenticated!');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        return next(err);
    }
}
 
// First step is the authentication of the client
app.use(authentication)
app.use(express.static(path.join(__dirname, 'public/index.html')));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/index.html");
})

app.get("/signup",function(req,res){
    var mongojs=require("mongojs");
    var cs="mongodb+srv://mahesh:mahesh@cluster0.qe4fh.mongodb.net/Digitalflowtask?retryWrites=true&w=majority"
    var db=mongojs(cs,["users"])

    var e = {
        Email:req.query.mail,
        Username:req.query.uname
    }
    db.users.find(e,function(err,docs){
        if(docs.length!=0){
            res.send('email and username is already registered')
        }else{
            var d={
                Username:req.query.uname,
                Name:req.query.name,
                Email:req.query.mail,
                Password:req.query.pswd,
                Address:req.query.add,
                Mobile:req.query.num,
            }
            db.users.insert(d,function(err,docs){
            if(err){
                res.send('Something went wrong')
            }else{
                res.sendFile(__dirname+"/public/index.html")
            }
            })
        }
    })

    bcrypt.hash(req.query.pswd, 10, function (err, hash) {
        console.log(hash);
    });

    bcrypt.genSalt(10, function (err, salt) {
        console.log(salt); // the random salt string
    });

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.query.pswd, salt, function (err, hash) {
          console.log(hash);
          // Store hash in your password DB.
        });
    });

    bcrypt.hash(req.query.pswd, 10, function (err, hash) {
        console.log(hash);
        // The hash returned, continue to compare
        bcrypt.compare(req.query.pswd, hash, function (err, result) {
          console.log("password:", result); 
        });
    });
})

app.post('/login',function(req,res){
    sess = req.session;
    var mongojs=require("mongojs");
    var cs="mongodb+srv://mahesh:mahesh@cluster0.qe4fh.mongodb.net/Digitalflowtask?retryWrites=true&w=majority"
    var db=mongojs(cs,["users"])
    var d={
        Email:req.body.mail,
        Password:req.body.pswd
    }
    sess.Email = req.body.mail;
	sess.Password = req.body.pswd;
    db.users.find(d,function(err,docs){
        if(docs.length==0){
            res.send('No user found')
        }
        else{
            res.render("profile",{data:docs});
        }
    })
})

app.get("/logout",(req,res)=>{
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Your node js server is running');
});