const mongoose = require("mongoose");
const express = require("express");
const app = express();

app.use(express.json());

mongoose
  .connect(`mongodb://MongoAdmin:${process.env.PASSWORD}@localhost:27017/admin`)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    age: { type: Number, min: 18 },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

app.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).send("User not found");
    res.send(user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
