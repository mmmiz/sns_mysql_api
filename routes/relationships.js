import express from "express";
const router = express.Router()
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

//  SELECT followedUserId FROM relationships WHERE followerUserId = 1

// GET followed friends
router.get('/', (req, res) => {
  const q = "SELECT followerUserId FROM relationships WHERE followedUserId = ?";
  db.query(q, [req.query.followedUserId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map(relationship=>relationship.followerUserId));
  });
})

// GET users the current logged user followed
router.get('/followings/:profileUserId', (req, res) => {
  const profileUser = req.params.profileUserId;
  const q = 
  `SELECT u.name 
   FROM users AS u 
   JOIN relationships AS r 
   ON u.id = r.followedUserId
   WHERE r.followerUserId = ?`;

  db.query(q, [profileUser], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    } 
    return res.status(200).json(data);
  });
});


// Users who following the current Logged User
router.get('/:userFollowingCurrentId', (req, res) => {
  const userFollowingId = req.params.userFollowingCurrentId;
  const q = 
  `SELECT u.name 
   FROM users AS u 
   JOIN relationships AS r 
   ON u.id = r.followedUserId
   WHERE r.followerUserId = ?`;

  db.query(q, [currentLoggedUserId], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    } 
    return res.status(200).json(data);
  });
});
 
// router.get("/", (req, res) => {
//   const q = "SELECT u.* FROM relationships AS r JOIN users AS u ON (u.id = r.followedUserId) WHERE r.followerUserId = ?";
//   db.query(q, [req.query.followedUserId], (err, data) => {
//     if (err) {
//       console.error("Error executing SQL query:", err);
//       return res.status(500).json({ error: "Internal Server Error" });
//     }
//     const followers = data.map((relationship) => (
//       {
//         // followerUserId: relationship.followerUserId,
//         followedUserId: relationship.followedUserId,
//       }
//     ))
//     return res.status(200).json(followers);
//   });
// });


router.post("/", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Validate that req.body.userId is present and not null
    if (!req.body.userId)  return res.status(400).json("Invalid userId in the request body");


    const q = "INSERT INTO relationships (`followerUserId`,`followedUserId`) VALUES (?, ?)";
    const values = [userInfo.id, req.body.userId];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      return res.status(200).json("Following");
    });
  });
});



router.delete("/", (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    try {
      const q = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";
      const values = [userInfo.id, req.query.userId];
      // for a DELETE request, the data is usually sent in the request parameters or URL, not in the request body.
      
      db.query(q, values, (err, data) => {
        // if (err) {
          console.error("Error executing DELETE query:", err);
        //   return res.status(500).json({ error: "Internal Server Error" });
        // }
        
        return res.status(200).json({ message: 'Success'});
      });
    } catch (err) {
      console.error("Error processing DELETE request:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});



export default router