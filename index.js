const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat");
const methodOverride = require("method-override");

const app = express();
const PORT = 3001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp");
}
main()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

const currUser = "Mitesh"; //   "Mitesh"

// Home route - Display all messages
app.get("/", async (req, res) => {
    const messages = await Chat.find({});
    
    // Ensure each message has `instance` (default to current date if missing)
    messages.forEach(msg => {
        if (!msg.instance) msg.instance = new Date();
    });

    res.render("index", { messages, user: currUser });
});

// Add new message (PATCH should be POST or PUT, but keeping it as is)
app.patch("/messages", async (req, res) => {
    await new Chat({
        sentFrom: req.body.sentFrom,
        sentTo: req.body.sentTo,
        message: req.body.message,
        instance: new Date() // Ensure `instance` is always set
    }).save();
    res.redirect("/");
});

// Edit message page
app.get("/message/:id/edit", async (req, res) => {
    const msg = await Chat.findById(req.params.id);
    res.render("message", { msg, user: currUser });
});

// Update message
app.patch("/message/:id", async (req, res) => {
    await Chat.findByIdAndUpdate(req.params.id, { message: req.body.msg }, { new: true });
    res.redirect("/");
});

// Delete message
app.delete("/message/:id", async (req, res) => {
    await Chat.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});
