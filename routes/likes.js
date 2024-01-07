import express from "express";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
const router = express.Router();


router.get("/", (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";
  // the userId of people who liked a particular post. 
  db.query(q, [req.query.postId], (err, data) => {
    if (err) return res.status(500).json(err);
    // console.log('Liked result:', data);
    return res.status(200).json(data.map(like=>like.userId));
  });

})

// GET my liked posts Params ver 
// router.get("/mylikes/:userId", (req, res) => {
//   const likedUserId = req.params.userId; 
//   console.log('likedUserId:', likedUserId);
//   // const q = `
//   //   SELECT p.*, l.userId AS likedUserId, u.name, u.profilePic
//   //   FROM posts AS p
//   //   JOIN likes AS l ON p.id = l.postId
//   //   JOIN users AS u ON u.id = p.userId
//   //   WHERE l.userId = ?`;
//   const q = `SELECT p.*
//   FROM posts AS p
//   JOIN likes AS l ON p.id = l.postId
//   WHERE l.userId = ?;
//   `;
//   db.query(q, [likedUserId], (err, data) => {
//     if (err) {
//       console.error('Error executing query:', err);
//       return res.status(500).json(err);
//     }
//     console.log('Query result:', data);
//     return res.status(200).json(data);
//   });
// });

router.get("/mylikes", (req, res) => {
  const likedUserId = req.query.likedUserId;  
  // this likedUserId has to match the const 
  // req.query.likedUserId is from client side mylikes?likedUserId= and the const is passing the info to query 
  // console.log('likedUserId:', likedUserId);

  const q = `
    SELECT p.*, u.id AS userId, name, profilePic 
    FROM posts AS p
    JOIN likes AS l ON p.id = l.postId
    JOIN users AS u ON u.id = p.userId
    WHERE l.userId = ?`;

    // MY posts
    // `SELECT p.*, u.id AS userId, name, profilePic 
    // FROM posts AS p 
    // JOIN users AS u 
    // ON (u.id = p.userId)
    // WHERE p.userId = ?`;

  db.query(q, [likedUserId], (err, data) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json(err);
    }

    // console.log('Query result:', data);

    // Assuming you want to return the entire post information
    return res.status(200).json(data);
  });
});




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