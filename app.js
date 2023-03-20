//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-long:Long123%40@long.8xtpxyr.mongodb.net/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to my todo list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({})
    .then(function(foundItem) {
      if (foundItem.length === 0) {
        Item.insertMany(defaultItems)
          .then(function() {
            console.log("Inserted");
          }).catch(function() {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItem
        });
      }

    }).catch(function() {
      console.log("Failed");
    });

});

app.post("/", function(req, res) {

      const itemName = req.body.newItem;
      const listName = req.body.list;

      const item = new Item({
        name: itemName
      });

      async function save(model) {
        await model.save();
      }

      if (listName === "Today") {
        item.save();
        res.redirect("/");
      } else {
        List.findOne({name: listName})
          .then(function(foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
          }).catch(function() {
            console.log("Wrong!");
          });
      }
});

      app.post("/delete", function(req, res) {
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if (listName === "Today"){
          async function findByIdAndRemove(checkedItemId) {
            await Item.findByIdAndRemove(checkedItemId).exec();
            res.redirect("/");
          };
          findByIdAndRemove(checkedItemId);
        } else {
          List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
          .then (function(){
            res.redirect("/" + listName);
          }).catch(function(){
            console.log("Something Wrong!");
          });
        }
});

      app.get("/:customListName", function(req, res) {
        const customListName = _.capitalize(req.params.customListName);

        List.findOne({
            name: customListName
          })
          .then(function(foundList) {
            if (!foundList) {
              //create a new list
              const list = new List({
                name: customListName,
                items: defaultItems
              });
              list.save();
              res.redirect("/" + customListName);
            } else {
              res.render("list", {
                listTitle: foundList.name,
                newListItems: foundList.items
              });
            }
          }).catch(function() {
            console.log("1");
          });
      });

      app.get("/work", function(req, res) {
        res.render("list", {
          listTitle: "Work List",
          newListItems: workItems
        });
      });

      app.get("/about", function(req, res) {
        res.render("about");
      });

      //ignore favicon.ico
      app.get('/favicon.ico', function(req, res) {
        res.status(204);
        res.end();
      });

      app.listen(3000, function() {
        console.log("Server started on port 3000");
      });
