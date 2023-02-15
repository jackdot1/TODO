//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
var _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://nick:nick123@cluster0.u5mcsqi.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

const todoSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", todoSchema);

const item1 = new Item({
  name: "Welcome to your todolist.",
});
const item2 = new Item({
  name: "Hit + to add new item.",
});
const item3 = new Item({
  name: "<--  Hit thiis to delete an item.",
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
  const day = _.capitalize(date.getDay());

  Item.find({}, (err, foundItem) => {
    if (err) {
      console.log(err);
    } else {
      if (foundItem.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("sucessfully inserted the default items");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: foundItem });
      }
    }
  });
});




app.post("/add", function (req, res) {

  const day = _.capitalize(date.getDay());
  const itemName = req.body.newItem;
  const listName = req.body.list;

  let itemz = new Item({
    name: itemName,
  });

  let newUpdateItem = {name : itemName};

  if(listName === day){
        itemz.save();
        res.redirect("/");
  }else{
    // console.log(newUpdateItem);
    List.updateOne({name :listName} , {$push : {items : newUpdateItem}},(err) =>{
      if (err) {
        console.log(err);
      } else {
    res.redirect("/" + listName);
      }
    });
  }
});





app.post("/delete", function (req, res) {
  // console.log(req.body);
  const day = _.capitalize(date.getDay());
  const listName = req.body.delList;
  const userCheckedBox = req.body.checkBox;


if (listName === day) {



  Item.findByIdAndRemove(userCheckedBox, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Succesfully deleted");
    }
    res.redirect("/");
  });

}
 else {


    // console.log(req.body.checkBox);
    List.findOneAndUpdate({name :listName} ,{$pull : {items : {_id : userCheckedBox}}},(err,foundList) =>{
      if (err) {
        console.log(err);
      } else {
    res.redirect("/" + listName);
      }
    });


}
});







const listSchema = new mongoose.Schema({
  name: String,
  items: [todoSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/:topic", (req, res) => {
  // console.log(req.params.topic);
  const customListName = _.capitalize(req.params.topic);
  List.findOne({ name: customListName }, (err, foundItem) => {
    if (err) {
      console.log(err);
    } else {
      if(!foundItem) {
        // console.log("not exists");
        const arr = [{ name: customListName , items:defaultItems }];
        List.insertMany(arr, (err,docs) => {
          if (err) {
            console.log(err);
          } else {
            console.log("sucessfully inserted the default items");
          }
        });
        res.redirect("/"+customListName);
      }else{
        // console.log("exists!!!");
        res.render("list", { listTitle: foundItem.name , newListItems: foundItem.items });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
