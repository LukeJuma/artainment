<?php
// Database configuration for Namecheap hosting
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // These will be your actual Namecheap database credentials
        $this->host = "localhost"; // Usually localhost on shared hosting
        $this->db_name = "your_db_name"; // Replace with actual database name
        $this->username = "your_db_user"; // Replace with actual username
        $this->password = "your_db_password"; // Replace with actual password
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>