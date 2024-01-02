import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTER
export const register = (req, res) => {
  // CHECK USER IF EXISTS
  const checkUserQuery = "SELECT * FROM users WHERE username = ?";

  db.query(checkUserQuery, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);

    // Ensure that data is defined and has at least one record
    if (data && data.length === 0) {
      // FETCH MAX USER ID
      const fetchMaxIdQuery = "SELECT MAX(id) AS maxId FROM users";
      db.query(fetchMaxIdQuery, (err, maxIdData) => {
        if (err) return res.status(500).json(err);

        const user = maxIdData[0];
        const nextUserId = user.maxId + 1;

        // CREATE A NEW USER
        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);

        const insertQuery =
          "INSERT INTO users (`id`,`username`,`email`,`password`,`name`) VALUES (?, ?, ?, ?, ?)";

        const insertValues = [
          nextUserId,
          req.body.username,
          req.body.email,
          hashedPassword,
          req.body.name,
        ];

        db.query(insertQuery, insertValues, (err, insertData) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json("User has been created.");
        });
      });
    } else {
      return res.status(409).json("User already exists!");
    }
  });
};




// LOGIN
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");

    // loop thr the user list and access the fist one matching to the data[0]

    const checkPassword = bcrypt.compareSync(
      req.body.password,
      data[0].password
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
};


// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("accessToken",{
    secure:true,
    sameSite:"none"
  }).status(200).json("User has been logged out.")
};
