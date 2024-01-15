// const router = require("express").Router();
// import { login,register,logout } from "../controllers/auth.js";
// router.post("/register", register)

import express from "express";
const router = express.Router()
import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// REGISTER
router.post("/register", (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");
    //CREATE A NEW USER  //Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q =
      "INSERT INTO users (`username`,`email`,`password`,`name`) VALUE (?)";

    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("User has been created.");
    });
  });
});


// LOGIN
router.post("/login", (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    // loop the the user list and access the fist one matching to the data[0]
    if (data.length === 0) return res.status(404).json("User not found!");

    const checkPassword = bcrypt.compareSync(
      req.body.password, data[0].password
    );

    if (!checkPassword)
      return res.status(400).json("Wrong password or username!");

    const token = jwt.sign({ id: data[0].id }, "secretkey");
    const { password, ...others } = data[0];
    res.cookie("accessToken", token, { httpOnly: true })
    .status(200).json(others);

    // const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    // res.status(200).json({ token, message: 'Login successful!' });
  });
});


//LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken",
  {
    secure:true,
    sameSite:"none"
  }
  ).status(200).json("User has been logged out.")
});


export default router