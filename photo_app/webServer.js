/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();

const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
const fs = require("fs");
const cs142password = require("./cs142password");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const cs142models = require("./modelData/photoApp.js").cs142models;

app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /test/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      const schemaInfo = {
        version: info[0].version,
        load_date_time: info[0].load_date_time,
      };
      if(request.session.user_id){
        schemaInfo.loggedInUser = {
          _id: request.session.user_id,
          first_name: request.session.first_name,
        };
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", schemaInfo);
      response.end(JSON.stringify(schemaInfo));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  User.find({}, function(err, info){
    if (err) {
      console.error("Error in /user/:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    const userList = [];
    for(let i = 0; i < info.length; i++){
      userList.push({
        _id: info[i]._id.toString(),
        first_name: info[i].first_name,
        last_name: info[i].last_name,
        login_name: info[i].login_name,
      });
    }
    console.log("User List:", userList);
    response.end(JSON.stringify(userList));
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, response) {
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  const id = request.params.id;
  User.find({_id: id}, function(err, info){
    if (err) {
      if(err.name === 'CastError'){
        response.status(400).send("Id not valid");
      }
      else{
        console.error(`Error in /user/${id}:`, err);
        response.status(500).send(JSON.stringify(err));
      }
      return;
    }
    if(info.length === 0){
      response.status(400).send("User not found");
      return;
    }
    const response_object = {
      _id: info[0]._id.toString(),
      first_name: info[0].first_name,
      last_name: info[0].last_name,
      location: info[0].location,
      description: info[0].description,
      occupation: info[0].occupation,
    };
    console.log("User found:", response_object);
    response.end(JSON.stringify(response_object));
  });
});

/**
 * URL /mostRecentPhoto/:id - Returns most recent photo of user (id)
 */
app.get("/mostRecentPhoto/:id", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  const id = request.params.id;
  Photo.aggregate([
    {$match: {
      user_id: mongoose.Types.ObjectId(id),
    }},
    {$sort: {
      date_time: -1,
    }},
    {$limit: 1}
  ], function(err, recent_photo){
    if(err){
      response.status(500).send(JSON.stringify(err));
      return;
    }
    let response_object = null;
    if(recent_photo.length !== 0){
      response_object = {
        file_name: recent_photo[0].file_name,
        date_time: recent_photo[0].date_time,
      };
    }
    console.log("Most Recent Photo:", response_object);
    response.end(JSON.stringify(response_object));
  });
});

/**
 * URL /mostCommentPhoto/:id - Returns photo with most comments of user (id)
 */
app.get("/mostCommentPhoto/:id", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  const id = request.params.id;
  Photo.aggregate([
    {$match: {
      user_id: mongoose.Types.ObjectId(id),
    }},
    {$unwind: "$comments"},
    {$group: {
      _id: {
        id: "$_id",
        file_name: "$file_name",
      },
      comment_count: {$sum : 1}
    }},
    {$sort: {comment_count: -1}},
    {$limit: 1}
  ], function(err, most_comment_photo){
    if(err){
      response.status(500).send(JSON.stringify(err));
      return;
    }
    let response_object = null;
    if(most_comment_photo.length !== 0){
      response_object = {
        file_name: most_comment_photo[0]._id.file_name,
        comment_count: most_comment_photo[0].comment_count,
      };
    }
    console.log("Most Comment Photo:", response_object);
    response.end(JSON.stringify(response_object));
  });
});

/**
 * URL /mentionPhotos/:id - Returns photo with most comments of user (id)
 */
app.get("/mentionPhotos/:id", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  const id = request.params.id;
  const matching_regex = new RegExp(`@\\[([^\\]]+)\\]\\((${id})\\)`, "g");
  Photo.aggregate([
    {$match: {
      "comments.comment": {
        $regex: matching_regex,
      }
    }},
    {$lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user_info",
    }},
    {$project: {
      file_name: 1,
      uploader_id: {$first: "$user_info._id"},
      uploader_first_name: {$first: "$user_info.first_name"},
      uploader_last_name: {$first: "$user_info.last_name"},
    }}
  ], function(err, mentions){
    if(err){
      console.log(err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    console.log("Mentions found", mentions);
    response.end(JSON.stringify(mentions));
  });
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  const id = request.params.id;
  User.find({}, function(userErr, users){
    if(userErr){
      console.error(`Error in /photosOfUser/${id}`, userErr);
      response.status(500).send(JSON.stringify(userErr));
      return;
    }
    let userMap = new Map();
    for(let i = 0; i < users.length; i++){
      userMap.set(users[i]._id.toString(), users[i]);
    }
    if(!userMap.has(id)){
      response.status(400).send("User not found");
      return;
    }
    Photo.find({user_id: id}, function(photoErr, photos){
      if(photoErr){
        if(photoErr.name === 'CastError'){
          response.status(400).send("Id not valid");
        }
        else{
          console.error(`Error in /photosOfUser/${id}`, photoErr);
          response.status(500).send(JSON.stringify(photoErr));
        }
        return;
      }
      const photosFound = [];
      for(let i = 0; i < photos.length; i++){
        const thisPhoto = {
          _id: photos[i]._id,
          user_id: photos[i].user_id,
          file_name: photos[i].file_name,
          date_time: photos[i].date_time,
          comments: [],
        };
        for(let j = 0; j < photos[i].comments.length; j++){
          const commentUserInfo = userMap.get(photos[i].comments[j].user_id.toString());
          const thisComment = {
            _id: photos[i].comments[j]._id,
            date_time: photos[i].comments[j].date_time,
            comment: photos[i].comments[j].comment,
            user: {
              _id: commentUserInfo._id,
              first_name: commentUserInfo.first_name,
              last_name: commentUserInfo.last_name,
            }
          };
          thisPhoto.comments.push(thisComment);
        }
        photosFound.push(thisPhoto);
      }
      console.log("Photos found:", photosFound);
      response.end(JSON.stringify(photosFound));
    });
  });
});

/**
 * URL /admin/login - verifies user login info and logs user in  
 */
app.post("/admin/login", function(request, response){
  User.find({login_name: request.body.login_name}, function(err, users){
    if(err){
      console.log("Error in login:", err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if(users.length === 0){
      console.log("Not found");
      response.status(400).send("Login name doesn't exist");
      return;
    }
    if(!cs142password.doesPasswordMatch(users[0].password_digest, users[0].salt, request.body.password)){
      console.log("Credentials invalid");
      response.status(400).send("Credentials invalid");
      return;
    }
    request.session.user_id = users[0]._id;
    request.session.first_name = users[0].first_name;
    response.send(JSON.stringify({
      _id: users[0]._id,
      first_name: users[0].first_name,
    }));
  });
});

/**
 * URL /admin/logout - logs user out 
 */
app.post("/admin/logout", function(request, response){
  if(request.session.user_id === undefined){
    response.status(400).send("No user logged in");
    return;
  }
  request.session.destroy(function(err){
    if(err){
      console.log(err);
      response.status(500).send(JSON.stringify(err));
      return;
    }
    response.status(200).send("Logged out successfully");
  });
});

/**
 * URL /commentsOfPhoto/:photo_id - adds a new comment to photo photo_id
 */
app.post("/commentsOfPhoto/:photo_id", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  if(request.body.comment === ""){
    response.status(400).send("Comment is empty");
    return;
  }
  const newComment = {
    comment: request.body.comment,
    user_id: request.session.user_id,
  };
  Photo.findById(request.params.photo_id, function(err, photo){
    if(err){
      response.status(400).send(JSON.stringify(err));
      return;
    }
    Photo.findByIdAndUpdate(request.params.photo_id, {
      comments: [...photo.comments, newComment],
    }, function(err2){
      if(err2){
        response.status(500).send(JSON.stringify(err2));
        return;
      }
      response.status(200).send("Comment added");
    });
  });
});

/**
 * URL /removeComment - removes comment with id in body
 */
app.post("/removeComment", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  if(!request.body.comment_id){
    response.status(400).send("Missing comment id to remove");
    return;
  }
  console.log(request.body.comment_id);
  Photo.aggregate([
    {$unwind: "$comments"},
    {$match: {
      "comments._id": mongoose.Types.ObjectId(request.body.comment_id),
    }}
  ], function(err, photo_with_comment){
    if(err){
      response.status(500).send(JSON.stringify(err));
      return;
    }
    if(photo_with_comment.length === 0){
      response.status(500).send("Can't find photo with comment to delete");
      return;
    }
    if(photo_with_comment[0].comments.user_id.toHexString() !== request.session.user_id){
      response.status(400).send("Comment doesn't belong to user");
      return;
    }

    Photo.updateOne({_id: photo_with_comment[0]._id}, {$pull: {comments: {_id: request.body.comment_id}}}, function(remove_comment_err){
      if(remove_comment_err){
        response.status(500).send(JSON.stringify(remove_comment_err));
        return;
      }
      response.status(200).send("Removed Comment");
    });
  });
});

/**
 * URL /photos/new - adds a new photo
 */
app.post("/photos/new", processFormBody, function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  if(!request.file){
    response.status(400).send("No file sent");
    return;
  }
  console.log(request.file);
  const timestamp = new Date().valueOf();
  const filename = `U${String(timestamp)}${request.file.originalname}`;
  fs.writeFile(`./images/${filename}`, request.file.buffer, function(err1){
    if(err1){
      response.status(500).send(JSON.stringify(err1));
      return;
    }
    Photo.create({
      file_name: filename,
      user_id: request.session.user_id,
      comments: [],
    }).then(function(){
      response.status(200).send("Upload successful");
    }).catch(function(err2){
      console.log(err2);
      response.status(500).send(JSON.stringify(err2));
    });
  });
});

/**
 * URL /removePhoto - removes a photo of photo_id
 */
app.post("/removePhoto", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  if(!request.body.photo_id){
    response.status(400).send("Missing photo id to remove");
    return;
  }
  Photo.findById(request.body.photo_id).then(function(photo){
    if(photo.user_id.toHexString() !== request.session.user_id){
      response.status(400).send("Photo doesn't belong to user");
      return;
    }
    Photo.deleteOne({_id: request.body.photo_id}).then(function(){
      response.status(200).send("Removed Photo");
    }).catch(function(err){
      response.status(500).send(JSON.stringify(err));
    });
  }).catch(function(err){
    response.status(500).send(JSON.stringify(err));
  });
});

/**
 * URL /user - create new user
 */
app.post("/user", function(request, response){
  if(request.body.login_name === ""){
    response.status(400).send("Missing required fields");
    return;
  }
  User.exists({login_name: request.body.login_name}).then(function(found){
    if(found){
      response.status(400).send("Login name already in use");
      return;
    }
    const pwd = cs142password.makePasswordEntry(request.body.password);
    User.create({
      first_name: request.body.first_name,
      last_name: request.body.last_name,
      location: request.body.location,
      description: request.body.description,
      occupation: request.body.occupation,
      login_name: request.body.login_name,
      salt: pwd.salt,
      password_digest: pwd.hash,
    }).then(function(user_obj){
      response.status(200).send(JSON.stringify({login_name: user_obj.login_name}));
    }).catch(function(err){
      response.status(500).send(JSON.stringify(err));
    });
  }).catch(function(err){
    response.status(500).send(JSON.stringify(err));
  });
});

app.post("/deleteUser", function(request, response){
  if(request.session.user_id === undefined){
    response.status(401).send("Unauthorized");
    return;
  }
  if(!request.body.user_id){
    response.status(400).send("Missing user id to remove");
    return;
  }
  if(request.session.user_id !== request.body.user_id){
    response.status(400).send("User can't delete this account");
    return;
  }
  User.findById(request.body.user_id).then(function(user_found){
    if(!user_found){
      response.status(400).send("User doesn't exist");
      return;
    }
    Photo.deleteMany({user_id: request.body.user_id}).then(function(){
      Photo.updateMany({}, {$pull: {comments: {user_id: request.body.user_id}}}).then(function(){
        Photo.updateMany({
          "comments.comment": {
            $regex: `@\\[${user_found.first_name} ${user_found.last_name}\\]\\(${user_found._id}\\)`
          }
        }, 
        [{
          $set: {
            comments: {
              $map: {
                input: "$comments",
                in: {
                  $mergeObjects: [
                    "$$this", 
                    {comment: {
                      $replaceAll: {
                        input: "$$this.comment",
                        find: `@[${user_found.first_name} ${user_found.last_name}](${user_found._id})`,
                        replacement: "[Deleted User]",
                      }
                    }}
                  ]
                }
              }
            }
          }
        }]).then(function(){
          User.deleteOne({_id: request.body.user_id}).then(function(){
            response.status(200).send("Deleted Account");
          }).catch(function(err){
            console.log(err);
            response.status(500).send(JSON.stringify(err));
          });
        }).catch(function(err){
          console.log(err);
          response.status(500).send(JSON.stringify(err));
        });
      }).catch(function(err){
        response.status(500).send(JSON.stringify(err));
      });
    }).catch(function(err){
      response.status(500).send(JSON.stringify(err));
    });
  }).catch(function(err){
    response.status(500).send(JSON.stringify(err));
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
