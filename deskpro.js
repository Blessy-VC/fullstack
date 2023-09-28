var express = require("express");
var app = express();
var passwordHash = require('password-hash');
//var hashedPassword = passwordHash.generate('password123');
app.use(express.static('public'));
const axios = require('axios');
const request = require('request');

app.set("view engine","ejs");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore,Filter } = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");


initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/" + "food.html");
    
});

app.get("/signupSubmit", function (req, res) {
    db.collection("Signup")
    .where(
        Filter.or(
            Filter.where("Email","==",req.query.Email),
            Filter.where("Fullname","==",req.query.FullName)
        )
    )
    .get()
    .then((docs)=>{
        if(docs.size>0){
            res.send("this account is already existed,please try with another email or username")
        }
        else{
            
                db.collection('Signup').add({
                Fullname: req.query.FullName,
                Email: req.query.Email,
                Password: passwordHash.generate(req.query.Password)
            }).then(() => {
                res.sendFile(__dirname + "/public/" + "login.html"); 
            }).catch(()=>{
                res.send("something went wrong")
            });
          
            
        }
    });
    
});


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/" + "food.html"); 
 
});
app.get("/loginSubmit", function (req, res) {
   // passwordHash.verify(req.query.Password,hashedPassword)
    db.collection('Signup')
   .where("Email","==",req.query.Email)
   .get()

  .then((docs)=>{
      var verified=false;
      docs.forEach((doc)=>{
        verified=passwordHash.verify(req.query.Password,doc.data().Password)
      });
    if(verified){
        res.redirect("/food.html");
     }
     else{
        res.send("you have failed logging in please check once again");
    }
    });
    
  
});
app.listen("4002");