import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: null,
  database: "sns_sql"
});


db.connect((err) => {
  if(err) {
    console.log('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL!');
})