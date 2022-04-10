const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {promisify} = require('util'); //for decoding the cookie id to check whether the user is logged in or not
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const _ = require('lodash');
const fileUpload = require('express-fileupload');
const http= require('http');
const socketio = require('socket.io');

dotenv.config({path:'./secret.env'});

const app = express();
const server = http.createServer(app);
const io= socketio(server);
var connectedUsers = [];
var socketIDs =[];

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

app.use(fileUpload());

app.use(session({
  secret:"Ourlittlesecret.",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-krish:"+process.env.MONGO_PASSWORD+"@cluster0.egn6c.mongodb.net/Quorum?retryWrites=true&w=majority",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  googleId:String,
  facebookId:String,
  userphoto:String,
});

const questionsSchema = new mongoose.Schema({
  question:String,
  user_id:String,
  user_name:String,
  user_dp:String,
  space:String,
  upvotes:{
    type:Array,
    items:{
      type:String
    }
  },
  downvotes:{
    type:Array,
    items:{
      type:String
    }
  },
  drafts:{
    type:Array,
    items:{
      type:String
    }
  },
  date:Date,
  status:String
});

const answerSchema = new mongoose.Schema({
  question_id:String,
  answer:String,
  images:String,
  user_id:String,
  user_name:String,
  user_dp:String,
  upvotes:{
    type:Array,
    items:{
      type:String
    }
  },
  downvotes:{
    type:Array,
    items:{
      type:String
    }
  },
  date:Date
});

const commentSchema = new mongoose.Schema({
  ans_id:String,
  user_name:String,
  user_dp:String,
  date:Date,
  content:String,
  downvotes:{
    type:Array,
    items:{
      type:String
    }
  },
  upvotes:{
    type:Array,
    items:{
      type:String
    }
  }
});

const notificationSchema = new mongoose.Schema({
  from:String,
  fromphoto:String,
  fromName:String,
  to:String,
  tophoto:String,
  toName:String,
  type:String,
  status:String,
  members:{
    type:Array,
    items:{
      type:String
    }
  }
});

const messageSchema = new mongoose.Schema({
  message:String,
  from:String,
  to:String,
  members:{
    type:Array,
    items:{
      type:String
    }
  },
  date:Date
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

require('events').EventEmitter.defaultMaxListeners = 100;

const User = new mongoose.model("User",userSchema);
const Question = new mongoose.model("Question",questionsSchema);
const Answer = new mongoose.model("Answer",answerSchema);
const Comment = new mongoose.model("Comment",commentSchema);
const Notification = new mongoose.model("Notification",notificationSchema);
const Message = new mongoose.model("Message",messageSchema);

passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/quorum",
    userProfileURL:'https://www.googleapis.com/oauth2/v3/userinfo' //if google api deprecates this attribute is for retriving user info
  },
  function(accessToken, refreshToken,email, profile, cb) {
    User.findOrCreate({ username:profile.emails[0].value,name:profile.displayName,email:profile.emails[0].value,googleId: profile.id,userphoto:profile.photos[0].value }, function (err, user) {
      //console.log(profile);
      return cb(err, user);
    });
  }
));



isLoggedIn = async(req,res,next)=>{
  console.log(req.cookies);
  if(req.cookies.jwt){
    try{
      //we are verifying the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
      console.log(decoded);

      User.find({email:decoded.email},function(err,user){
        if(!user){
          return next();
        }
        console.log(user);
        req.user = user[0];
        return next();
      });
    }  catch(err){
      console.log(err);
      return next();
      }
    }
    else
    {
      return next();
    }

  }



app.get("/",function(req,res){
    res.redirect("/home");
});


app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/errorPage",function(req,res){
  res.render("errorpage");
});

app.get("/auth/google",
passport.authenticate("google", { scope:['profile','email'] })
);

app.get('/auth/google/quorum',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });

app.get("/home",isLoggedIn,function(req,res){
  if(req.user){
    //console.log(req.user);

    io.on('connection',function(socket){
      //console.log(req.user)
      //console.log(req.user.name," connected");
      ////console.log("New WS Connection",socket.id);
      //console.log(socketIDs[req.user._id.toString()],socket.id);
      socketIDs[req.user._id.toString()]=socket.id;
    });


    res.render("home",{
      User:req.user
    });
  }
  else
  {
    res.redirect("/login");
  }
});

app.get("/answer",isLoggedIn,function(req,res){
  if(req.isAuthenticated() || req.user){
    Question.find({},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        res.render("answer",{
          User:req.user,
          question:results
        });
      }
    });

  }
  else{
    res.redirect("/login");
  }
});

app.get("/notification",isLoggedIn,function(req,res){
  if(req.isAuthenticated() || req.user){
        res.render("notification",{
          User:req.user,
        });
  }
  else{
    res.redirect("/login");
  }
});

app.get("/answers/:questionid",isLoggedIn,function(req,res){
  if(req.user){

  Question.find({_id:req.params.questionid},function(err,result){
    if(err){
      //console.log(err);
    }
    else{
      if(result.length==0){
        res.redirect("/answer");
      }else{
        console.log(result);
        if(result[0].status == 'unanswered'){
          res.render("answerpage",{
            User:req.user,
            Question:result,
            Answer:[]
          });
        }
        else{
          Answer.find({question_id:req.params.questionid},function(e,results){
            if(e){
              console.log(e);
            }
            else{
              console.log(results);

              res.render("answerpage",{
                User:req.user,
                Answer:results,
                Question:result
              });
            }
          });
          }
        }}
  });
}else{
  res.redirect("/login");
}
});


app.get("/profile/:Userid",isLoggedIn,function(req,res){
  if(req.user){
  User.find({_id:req.params.Userid},function(err,result){
    if(err){
      //console.log(err);
    }
    else{
      let sum = req.user._id.toString();
      Notification.find({type:'request'},function(e,r){
        res.render("profile",{
          User:req.user,
          Profile:result,
          Notification:r
        });
      });
    }
  });
}else{
  res.redirect("/login");
}
});

app.get("/social",isLoggedIn,function(req,res){
  if(req.user){
  res.render("messages",{
    User:req.user
  });
}else{
  res.redirect("/login");
}
});

app.get("/logout",isLoggedIn,function(req,res){
  if (req.user){
    //console.log(req.user.name," logged out");
    delete socketIDs[req.user._id.toString()];
    //console.log(socketIDs);
      res.cookie("jwt","logout",{
        expires:new Date(Date.now()+2*1000),
        httpOnly:true
      });
     res.redirect("/");
}else{
  res.redirect("/login");
}
});

app.post("/register",function(req,res){

  User.find({email:req.body.email},function(err,user){
    if(err)
    {
      console.log(err);
    }
    else{
      if(user.length>0){
        res.redirect("/register");
      }
      else
      {
        bcrypt.hash(req.body.password,10,function(err,hash){
          if(err)
          {
            console.log(err);
          }
          else
          {
            const regUser = new User({
              email:req.body.email,
              username:req.body.email,
              password:hash,
              name:req.body.name,
              userphoto:"/images/user.jpg",
            });
            console.log(regUser);
            regUser.save();
          }

        });


        const email=req.body.email;
        const token = jwt.sign({ email: email },process.env.JWT_SECRET,{
          expiresIn : process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
          expires:new Date(
            Date.now()+ 90 *24* 60*60*1000
          ),
          httpOnly: true
        }

      res.cookie("jwt",token,cookieOptions);
      res.redirect("/home");
      }
    }
  });
});

app.post("/login",function(req,res){
  User.find({email:req.body.email},function(err,user){
    if(user.length>0)
    {
      console.log(user);
      bcrypt.compare(req.body.password,user[0].password,function(err,result){
        if(result == true)
        {
          const token = jwt.sign({email:req.body.email},process.env.JWT_SECRET,{
            expiresIn:process.env.JWT_EXPIRES_IN
          });

          const cookieOptions = {
            expires: new Date(
              Date.now() + 90*24*60*60*1000
            ),
            httpOnly:true
          }
          res.cookie("jwt",token,cookieOptions);
          res.redirect("/home");
        }
        else
        {
          res.redirect("/login");
        }
      });

    }
    else
    {
      res.redirect("/login");
    }
  });
});

app.post("/addQuestion",isLoggedIn,function(req,res){
  const identity = req.body.privacy;
  const questionAsked = _.capitalize(req.body.question);
  const spaceQ = req.body.topic;
  const tday = new Date();

  if(identity === "anonymous"){
        const questionObject = new Question({
          question:questionAsked,
          user_name:'Anonymous',
          upvotes:[],
          downvotes:[],
          drafts:[],
          space:spaceQ,
          date:tday,
          status:'unanswered'
        });
        questionObject.save();
      }
  else
  {
    const questionObject = new Question({
      question:questionAsked,
      user_id:req.user._id,
      user_name:req.user.name,
      user_dp:req.user.userphoto,
      upvotes:[],
      downvotes:[],
      drafts:[],
      space:spaceQ,
      date:tday,
      status:'unanswered'
    });
    questionObject.save();

  }
  res.redirect("/home");

});

app.post("/addAnswer/:questionid",isLoggedIn,function(req,res){

  const tday=new Date();
  if(req.body.answer == ""){
    //console.log("answer not provided");
    res.redirect("/answer");
  }
  if(!req.files)
  {
      //console.log("files not uploaded");
      const answerObject = new Answer({
        question_id:req.params.questionid,
        answer:req.body.answer,
        user_id:req.user._id,
        user_name:req.user.name,
        user_dp:req.user.userphoto,
        upvotes:[],
        downvotes:[],
        date:tday
      });
      answerObject.save();

      Question.updateOne({_id:req.params.questionid},{$set :{status:'answered'}},function(err,results){
        if(err){
          console.log(err);
        }
        else{
          console.log('updated');
        }
      });

      //console.log("Answer Added");
      res.redirect("/answers/"+req.params.questionid);
  }
  else{
    const files = req.files.ans_img;
    const imgName = files.name;

    if(files.mimetype == "image/jpeg" || files.mimetype == "image/png" || files.mimetype == "image/jfif"){
      files.mv("public/images/uploaded/"+imgName,function(err){
        if(err){
          console.log(err);
        }
        else{
          const answerObject = new Answer({
            question_id:req.params.questionid,
            answer:req.body.answer,
            images:imgName,
            user_id:req.user._id,
            user_name:req.user.name,
            user_dp:req.user.userphoto,
            upvotes:[],
            downvotes:[],
            date:tday
          });

          answerObject.save();
          //console.log("Answer Added");
          Question.updateOne({_id:req.params.questionid},{$set :{status:'answered'}},function(err,results){
            if(err){
              console.log(err);
            }
            else{
              console.log('updated');
            }
          });
          res.redirect("/answers/"+req.params.questionid);
        }
      });
    }else{
      //console.log("file not supported!!");
      res.redirect("/answer");
    }
  }
});

app.post("/addAnonymousAnswer/:questionid",isLoggedIn,function(req,res){
  //console.log(req.params.questionid);
  const tday=new Date();

  if(req.body.answer == ""){
    //console.log("answer not provided");
    res.redirect("/answer");
  }
  if(!req.files)
  {
      //console.log("files not uploaded");
      const answerObject = new Answer({
        question_id:req.params.questionid,
        answer:req.body.answer,
        user_name:'Anonymous',
        upvotes:[],
        downvotes:[],
        date:tday
      });
      answerObject.save();
      Question.updateOne({_id:req.params.questionid},{$set :{status:'answered'}},function(err,results){
        if(err){
          console.log(err);
        }
        else{
          console.log('updated');
        }
      });
      //console.log("Answer Added");
      res.redirect("/answers/"+req.params.questionid);
  }
  else{
    const files = req.files.ans_img;
    const imgName = files.name;
    //console.log(imgName);
    if(files.mimetype == "image/jpeg" || files.mimetype == "image/png" || files.mimetype == "image/jfif"){
      files.mv("public/images/uploaded/"+imgName,function(err){
        if(err){
          //console.log(err);
        }
        else{
          const answerObject = new Answer({
            question_id:req.params.questionid,
            answer:req.body.answer,
            images:imgName,
            user_name:'Anonymous',
            upvotes:[],
            downvotes:[],
            date:tday
          });

          answerObject.save();
          //console.log("Answer Added");
          Question.updateOne({_id:req.params.questionid},{$set :{status:'answered'}},function(err,results){
            if(err){
              console.log(err);
            }
            else{
              console.log('updated');
            }
          });
          res.redirect("/answers/"+req.params.questionid);
        }
      });
    }else{
      //console.log("file not supported!!");
      res.redirect("/answer");
    }
  }
});

//handling likes and dislikes


app.post("/increaseLikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  if(response){
    Question.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].upvotes.includes(req.user._id) == false) && (results[0].downvotes.includes(req.user._id) == false) ) {
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          Question.updateOne({question:results[0].question},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log(r);
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          const updateDownVotes = results[0].downvotes;
          ////console.log(updateDownVotes,updateUpVotes);
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          Question.updateMany({question:results[0].question},{$set : {upvotes:updateUpVotes,downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("upvote one");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          //console.log(updateUpVotes);
          Question.updateOne({question:results[0].question},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("voting done");
            }
          });
        }
        //console.log(res);
        res.redirect("/answer");
      }
    });

  }
  else{
    console.log("error");
  }
});

app.post("/addToDrafts",isLoggedIn,function(req,res){
  var response = req.body.qid;
  //console.log(response);
  if(response){
    Question.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
          const updateDrafts = results[0].drafts;
          updateDrafts.push(req.user._id);
          Question.updateOne({question:results[0].question},{$set : {drafts:updateDrafts}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        //console.log(res);
    });
  }
  else{
    console.log("error");
  }
});


app.post("/increaseDislikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  //console.log(response);
  if(response){
    Question.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].downvotes.includes(req.user._id) == false) && (results[0].upvotes.includes(req.user._id) == false) ) {
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          Question.updateOne({question:results[0].question},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          const updateUpVotes = results[0].upvotes;
          //console.log(updateUpVotes,updateDownVotes);
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          Question.updateMany({question:results[0].question},{$set : {downvotes:updateDownVotes,upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          //console.log(updateDownVotes);
          Question.updateOne({question:results[0].question},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        res.redirect("/answer");
      }
    });

  }
  else{
    console.log("error");
  }
});

app.post("/getAnsLikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  //console.log(response);
  if(response){
    Answer.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].upvotes.includes(req.user._id) == false) && (results[0].downvotes.includes(req.user._id) == false) ) {
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          Answer.updateOne({answer:results[0].answer},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          const updateDownVotes = results[0].downvotes;
          //console.log(updateDownVotes,updateUpVotes);
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          Answer.updateMany({answer:results[0].answer},{$set : {upvotes:updateUpVotes,downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("done");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          //console.log(updateUpVotes);
          Answer.updateOne({answer:results[0].answer},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("hello");
            }
          });
        }
        res.redirect("/answer");
      }
    });
  }
  else{
    console.log("error");
  }
});


app.post("/getAnsDislikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  console.log(response);
  if(response){
    Answer.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].downvotes.includes(req.user._id) == false) && (results[0].upvotes.includes(req.user._id) == false) ) {
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          Answer.updateOne({answer:results[0].answer},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          const updateUpVotes = results[0].upvotes;
          //console.log(updateUpVotes,updateDownVotes);
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          Answer.updateMany({answer:results[0].answer},{$set : {downvotes:updateDownVotes,upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          //console.log(updateDownVotes);
          Answer.updateOne({answer:results[0].answer},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        res.redirect("/answer");
      }
    });
  }
  else{
    //console.log("error");
  }
});

app.post("/getCommentsLikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  //console.log(response);
  if(response){
    Comment.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].upvotes.includes(req.user._id) == false) && (results[0].downvotes.includes(req.user._id) == false) ) {
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          Comment.updateOne({content:results[0].content},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.push(req.user._id);
          const updateDownVotes = results[0].downvotes;
          //console.log(updateDownVotes,updateUpVotes);
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          Comment.updateMany({content:results[0].content},{$set : {upvotes:updateUpVotes,downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateUpVotes = results[0].upvotes;
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          //console.log(updateUpVotes);
          Comment.updateOne({content:results[0].content},{$set : {upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        //console.log(res);
      }
    });
  }
  else{
    console.log("error");
  }
});

app.post("/getCommentsdisLikes",isLoggedIn,function(req,res){
  var response = req.body.value;
  //console.log(response);
  if(response){
    Comment.find({_id:response},function(err,results){
      if(err)
      {
        console.log(err);
      }
      else
      {
        if ( (results[0].downvotes.includes(req.user._id) == false) && (results[0].upvotes.includes(req.user._id) == false) ) {
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          Comment.updateOne({content:results[0].content},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].upvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.push(req.user._id);
          const updateUpVotes = results[0].upvotes;
          //console.log(updateUpVotes,updateDownVotes);
          updateUpVotes.splice(updateUpVotes.indexOf(req.user._id),1);
          Comment.updateMany({content:results[0].content},{$set : {downvotes:updateDownVotes,upvotes:updateUpVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        else if(results[0].downvotes.includes(req.user._id) == true){
          const updateDownVotes = results[0].downvotes;
          updateDownVotes.splice(updateDownVotes.indexOf(req.user._id),1);
          //console.log(updateDownVotes);
          Comment.updateOne({content:results[0].content},{$set : {downvotes:updateDownVotes}},function(error,r){
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log("updated");
            }
          });
        }
        //console.log(res);
      }
    });
  }
  else{
    console.log("error");
  }
});


app.post("/AddCmtsPost",isLoggedIn,function(req,res){
  //console.log(req.body.cmt);
  const tdy = new Date();
  const cmtObject = new Comment({
    ans_id:req.body.ans_id,
    user_name:req.user.name,
    user_dp:req.user.userphoto,
    date:tdy,
    content:req.body.cmt,
    downvotes:[],
    upvotes:[]
  });

  cmtObject.save();
});

app.post("/addFriend",isLoggedIn,function(req,res){
  let req_sent = req.body.reqsent;
  let req_got = req.body.reqgot;

  User.find({_id:req_got},function(err,results){
    if(err){
      console.log(err);
    }
    else
    {
      //console.log(results);
      const notificationObject = new Notification({
        from:req_sent,
        fromphoto:req.user.userphoto,
        fromName:req.user.name,
        to:req_got,
        tophoto:results[0].userphoto,
        toName:results[0].name,
        type:"request",
        status:"pending",
        members:[req_sent,req_got]
      });
      //console.log(notificationObject);

      notificationObject.save();
    }
  });
});

app.post("/removeFriend",isLoggedIn,function(req,res){
  let userid = req.body.userid;
  let friendid = req.body.friendid;
  Notification.deleteOne({to:req.user._id,from:friendid,status:"accepted",type:"request"},function(e,r){
      if(e){
        console.log(e);
      }
      else{
        console.log("updated");
      }
  });
  Notification.deleteOne({to:friendid,from:req.user._id,status:"accepted",type:"request"},function(e,r){
      if(e){
        console.log(e);
      }
      else{
        console.log("updated");
      }
    });
  });

app.post("/friendRequestAccepted",isLoggedIn,function(req,res){
  const friendId = req.body.fromid;
  const userId = req.body.toid;
  Notification.updateOne({to:req.user._id,from:friendId,status:"pending"},{$set:{status:"accepted"}},function(e,r){
        if(e){
          console.log(e);
        }
        else{
          console.log("updated");
        }
      });
  });

app.post("/friendRequestDeleted",isLoggedIn,function(req,res){
  const fromid = req.body.fromid;
  const toid = req.body.toid;

  Notification.deleteOne({from:fromid,to:toid,type:"request",status:"pending"},function(e){
    if(e){
      console.log(e);
    }
  });
});

app.post("/addChatMessage",isLoggedIn,function(req,res){
  const fromid = req.body.fromid;
  const toid = req.body.toid;
  const content = req.body.content;
  const members = [fromid,toid];
  const date = new Date();

  const messageObject = new Message({
    from:fromid,
    to:toid,
    message:content,
    members:members,
    date:date
  });

  messageObject.save();
//console.log("new message added");
//console.log(toid,connectedUsers[toid]);
//console.log("*********");

io.to(connectedUsers[toid]).emit("messageReceived",{
  message:content,
  from:fromid
});


});


app.post("/connectSocket",isLoggedIn,function(req,res){
  //console.log(req.body.userid);
  User.find({_id:req.body.userid},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      //console.log("connect socket in server");
      //console.log(socketIDs[results[0]._id.toString()]);
      connectedUsers[results[0]._id.toString()] = socketIDs[results[0]._id.toString()];
      //console.log(connectedUsers[results[0]._id.toString()]);
      //console.log("************");
    }
  });
});


//Rest api
app.get("/questions",isLoggedIn,function(req,res){
  if(req.user){
  Question.find({},function(err,results){
    if(err)
    {
      console.log(err);
    }
    else
    {
      //console.log(results);
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getAnswer",isLoggedIn,function(req,res){
  if(req.user){
  Answer.find({},function(err,results){
    if(err)
    {
      console.log(err);
    }
    else
    {
      //console.log(results);
      res.send(results);
    }
  });
  }else{
  res.redirect("/errorPage");
}
});

app.get("/getComments",isLoggedIn,function(req,res){
  if(req.user){
  Comment.find({},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      //console.log(results);
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getUsers",isLoggedIn,function(req,res){
  if(req.user){
  User.find({},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      //console.log(results);
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getStats",isLoggedIn,function(req,res){
  if(req.user){
    User.find({},async function(err,users){
      if(err){
        console.log(err);
      }else{
        await Question.find({},async function(er,questions){
          if(er){
            console.log(er);
          }else{
            await Answer.find({},async function(e,ans){
              if(e){
                console.log(e);
              }else{
                res.send({users:users.length,questions:questions.length,answers:ans.length})
              }
            })
          }
        })
      }
    })
}else{
  res.redirect("/errorPage");
}
});

app.get("/particularNotifications/:userid",isLoggedIn,function(req,res){
  if(req.user){
  //console.log(req.params.userid);
  Notification.find({to:req.params.userid,type:"request",status:"pending"},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      //console.log(results);
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getFriendsOfUser/:userid",isLoggedIn,function(req,res){
  if(req.user){
  //console.log(req.params.userid);
  Notification.find({type:"request",status:"accepted",members: { $in : [req.params.userid]}},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      //console.log(results);
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getPrivateMessages/:friendid",isLoggedIn,function(req,res){
  if(req.user){
  //console.log(req.params.friendid);
  let user_id = req.user._id.toString();
  Message.find({members:{$in : [req.params.friendid,user_id]}},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      res.send(results);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/UserQuestions/:userid",isLoggedIn,function(req,res){
  if(req.user){
  //console.log(req.params.userid);
  Question.find({user_id:req.params.userid},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      res.send(result);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/UserAnswers/:userid",isLoggedIn,async function(req,res){
  if(req.user){
  //console.log(req.params.userid);
  Answer.find({user_id:req.params.userid},async function(err,result){
    if(err){
      console.log(err);
    }
    else{
      var questions=[];
      for(var i=0;i<result.length;i++){
        var q;
        await Question.find({_id:result[i].question_id},function(e,results){
          if(e){
            console.log(e);
          }else{
            q=results[0].question;
          }
        });
        questions[i]=q;
      }
      const returnObj = result.map((item,index)=>({...item,'question':questions[index]}));
      //console.log(returnObj);
      res.send(returnObj);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/getAllQuestionsAndAnswers",isLoggedIn,async function(req,res){
  if(req.user){
  Answer.find({},async function(err,result){
    if(err){
      console.log(err);
    }
    else{
      var questions=[];
      for(var i=0;i<result.length;i++){
        var q;
        await Question.find({_id:result[i].question_id},function(e,results){
          if(e){
            console.log(e);
          }else{
            q=results[0].question;
          }
        });
        questions[i]=q;
      }
      const returnObj = result.map((item,index)=>({...item,'question':questions[index]}));
      //console.log(returnObj);
      res.send(returnObj);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.post("/deleteQuestion",isLoggedIn,function(req,res){
  const question_id=req.body.id;
  Question.deleteOne({_id: question_id},function(err,results){
    if(err){
      console.log(err);
    }
    else{
      console.log("updated");
    }
  });
  Answer.find({question_id:question_id},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      for(var i=0;i<result.length;i++){
        Comment.deleteMany({ans_id:result[i]._id},function(err){
          if(err){
            console.log(err);
          }
        });
        Answer.deleteOne({_id:result[i]._id},function(err){
          if(err){
            console.log(err);
          }
        });
      }
    }
  });
});

app.post("/deleteAnswer",isLoggedIn,function(req,res){
  const answer_id=req.body.ans_id;
  Comment.deleteMany({ans_id:answer_id},function(err){
    if(err){
      console.log(err);
          }
    });
    Answer.deleteOne({_id:answer_id},function(err){
      if(err){
        console.log(err);
        }
    });
  });

app.post("/deleteComments",isLoggedIn,function(req,res){
  const comment_id=req.body.comment_id;
  Comment.deleteOne({_id:comment_id},function(err){
    if(err){
      console.log(err);
          }
    });
});

app.get("/getParticularQuestion/:questionid",isLoggedIn,function(req,res){
  if(req.user){
  Question.find({_id:req.params.questionid},function(err,result){
    if(err){
      console.log(err);
    }else{
      res.send(result);
    }
  });
}else{
  res.redirect("/errorPage");
}
});

app.get("/showDrafts",isLoggedIn,function(req,res){
  if(req.user){
  Question.find({drafts: { $in : [req.user._id]}},function(err,result){
    if(err){
      console.log(err);
    }
    else{
      //console.log(result);
      res.send(result);
    }
  });
}else{
  res.redirect("/errorPage");
}
});


app.post("/removeFromDrafts",isLoggedIn,function(req,res){
  Question.find({_id:req.body.qid},function(err,result){
    if(err){
      console.log(err);
    }else{
        let updateDrafts = result[0].drafts;
        updateDrafts.splice(updateDrafts.indexOf(req.user._id),1);
        //console.log(updateDrafts);
        Question.updateOne({_id:result[0]._id},{$set:{drafts:updateDrafts}},function(e,r){
          if(e){
            console.log(e);
          }else{
            console.log("updated");
          }
        });
      }
  });
});

app.get('*',function(req,res){
  res.redirect("/errorPage")
})

//for chat application



server.listen(process.env.PORT || 3000,function(req,res){
  console.log("server running at port");
});
