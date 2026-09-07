<?php
class AuthController {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            return json_encode(['success' => false, 'message' => 'Email and password required']);
        }
        
        $email = $data['email'];
        $password = $data['password'];
        
        // Simple admin check (in production, use proper password hashing)
        if ($email === 'admin@theartainment.co.ke' && $password === 'Admin123!') {
            $token = 'admin-token-' . time();
            
            return json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => 1,
                    'name' => 'Admin',
                    'email' => $email,
                    'is_admin' => true
                ],
                'token' => $token
            ]);
        }
        
        // Check database for other users
        try {
            $query = "SELECT id, name, email, password_hash, is_admin FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (password_verify($password, $user['password_hash'])) {
                    $token = 'user-token-' . time();
                    
                    return json_encode([
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => [
                            'id' => $user['id'],
                            'name' => $user['name'],
                            'email' => $user['email'],
                            'is_admin' => (bool)$user['is_admin']
                        ],
                        'token' => $token
                    ]);
                }
            }
        } catch (Exception $e) {
            // If users table doesn't exist yet, ignore the error
        }
        
        http_response_code(401);
        return json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
    
    public function me() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            return json_encode(['error' => 'No token provided']);
        }
        
        $token = substr($authHeader, 7);
        
        // Simple token validation (in production, use proper JWT)
        if (str_starts_with($token, 'admin-token-')) {
            return json_encode([
                'id' => 1,
                'name' => 'Admin',
                'email' => 'admin@theartainment.co.ke',
                'is_admin' => true
            ]);
        }
        
        if (str_starts_with($token, 'user-token-')) {
            // In production, decode token to get user info
            return json_encode([
                'id' => 2,
                'name' => 'User',
                'email' => 'user@example.com',
                'is_admin' => false
            ]);
        }
        
        http_response_code(401);
        return json_encode(['error' => 'Invalid token']);
    }
}
?>