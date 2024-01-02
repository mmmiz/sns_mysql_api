import express from "express";
const router = express.Router();
import jwt from 'jsonwebtoken';
import moment from "moment";
import {db} from "../connect.js";


// POST a NEW 
router.post("/", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("No token provided");
    return res.status(401).json("Not logged in!");
  }
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json("Token is not valid!");
    }
    console.log("Decoded user info:", userInfo);

    const q = "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];
    console.log("Post values:", values);

    db.query(q, [values], (err, data) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Post has been created.");
    });
  });
});


// GET all posts 
router.get('/myposts', (req, res) => {
  const userId = req.query.userId; 
  const q = 
  `SELECT p.*, u.id AS userId, name, profilePic 
  FROM posts AS p 
  JOIN users AS u 
  ON (u.id = p.userId)
  WHERE p.userId = ?`;

  db.query(q, [userId ],(err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
})

router.get('/', (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    console.log(userId);

    const q =
      userId !== "undefined"
        ? `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
        : `SELECT p.*, u.id AS userId, name, profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
    LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) WHERE r.followerUserId= ? OR p.userId =?
    ORDER BY p.createdAt DESC`;

    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id]; // (u.id = p.userId) and ()

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
});


router.get("/mylikes", (req, res) => {
  const q = `
    SELECT p.*
    FROM posts p
    JOIN likes l ON p.postId = l.postId
    WHERE l.userId = ?;
  `;
    
  db.query(q, [req.user.userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(like => like.postId));
  });
});


router.delete("/:id", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM posts WHERE `id`=? AND `userId` = ?";
      // id = req.params.id / userId = userInfo.id

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      // userInfo.id: This is the user ID obtained from the decoded JWT token. It represents the user who is attempting to delete the post.
      if (err) return res.status(500).json(err);
      if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
});



export default router;
