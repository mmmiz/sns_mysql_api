import express from "express";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
const router = express.Router();


router.get("/", (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";
  // the userId of people who liked a particular post. 

  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(like=>like.userId));
  });
})

// router.get("/mylikes", (req, res) => {
//   const q = "SELECT postId FROM likes WHERE userId = ?";
  
//   db.query(q, [req.user.userId], (err, data) => {
//     if (err) return res.status(500).json(err);
//     return res.status(200).json(data.map(like => like.postId));
//   });
// });


router.post("/", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO likes (`userId`,`postId`) VALUES (?)";
    const values = [
      userInfo.id,
      req.body.postId
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been liked.");
    });
  });
})



router.delete("/", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";

    db.query(q, [userInfo.id, req.query.postId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been disliked.");
    });
  });
})


export default router