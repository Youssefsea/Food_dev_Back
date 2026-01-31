const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'food'
});


 pool.getConnection().then(connection => {
    console.log('Database connected successfully');
    connection.release();

}).catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);    
});



module.exports = pool;