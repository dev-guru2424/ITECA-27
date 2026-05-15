<?php
/**
 * ============================================
 * ITECA'27 — PHPMailer SMTP Email Sender
 * ============================================
 * 
 * This script:
 * 1. Receives JSON POST data from the frontend
 * 2. Sends a confirmation email via Gmail SMTP
 * 3. Returns JSON response
 * 
 * SETUP:
 * 1. Run: composer install (to install PHPMailer)
 * 2. Set your Gmail address and App Password below
 * 3. Host on XAMPP / InfinityFree / 000webhost
 * 
 * GMAIL APP PASSWORD:
 * 1. Go to https://myaccount.google.com/security
 * 2. Enable 2-Step Verification
 * 3. Go to https://myaccount.google.com/apppasswords
 * 4. Create an App Password for "Mail"
 * 5. Copy the 16-character password below
 * ============================================
 */

// ==========================================
// CORS HEADERS (Allow frontend to connect)
// ==========================================
// ⚠️ For production, replace * with your GitHub Pages URL
// Example: https://yourusername.github.io
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Only POST requests allowed'
    ]);
    exit();
}

// ==========================================
// GMAIL SMTP CONFIGURATION
// ==========================================

// ⚠️ REPLACE with your Gmail address
define('SMTP_EMAIL', 'vhnsnciteca27@gmail.com');

// ⚠️ REPLACE with your Gmail App Password (16 characters, no spaces)
define('SMTP_APP_PASSWORD', 'imiuytxwtugzjlow');

// Sender display name
define('SENDER_NAME', "ITECA'27");

// ==========================================
// LOAD PHPMailer
// ==========================================
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ==========================================
// READ INCOMING JSON DATA
// ==========================================
$jsonInput = file_get_contents('php://input');
$data = json_decode($jsonInput, true);

// Validate required fields
if (!$data || empty($data['email']) || empty($data['name']) || empty($data['competition'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields: email, name, competition'
    ]);
    exit();
}

$recipientEmail = $data['email'];
$participantName = $data['name'];
$competitionName = $data['competition'];
$teamMembers = isset($data['teamMembers']) ? $data['teamMembers'] : 'N/A';

// ==========================================
// SEND EMAIL VIA PHPMAILER
// ==========================================
$mail = new PHPMailer(true); // Enable exceptions

try {
    // --- SMTP Configuration ---
    $mail->isSMTP();                          // Use SMTP
    $mail->Host       = 'smtp.gmail.com';     // Gmail SMTP server
    $mail->SMTPAuth   = true;                 // Enable authentication
    $mail->Username   = SMTP_EMAIL;           // Gmail address
    $mail->Password   = SMTP_APP_PASSWORD;    // Gmail App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS encryption
    $mail->Port       = 587;                  // TLS port

    // --- Sender & Recipient ---
    $mail->setFrom(SMTP_EMAIL, SENDER_NAME);
    $mail->addAddress($recipientEmail, $participantName);

    // --- Email Content ---
    $mail->isHTML(true);
    $mail->Subject = "ITECA'27 Registration Successful";
    $mail->CharSet = 'UTF-8';

    // Plain text version (fallback)
    $mail->AltBody = "Welcome to ITECA'27!\n\n"
        . "Dear {$participantName},\n\n"
        . "You registered successfully for:\n"
        . "{$competitionName}\n\n"
        . "Thank you.\n\n"
        . "ITECA'27 Organizing Committee";

    // Beautiful HTML email body
    $mail->Body = '
    <div style="font-family: \'Segoe UI\', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 0;">
        <!-- Header with gradient -->
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7, #ec4899); padding: 36px 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: 1px;">ITECA\'27</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 15px;">Registration Confirmed ✅</p>
        </div>
        
        <!-- Body -->
        <div style="background: #1a1a2e; padding: 28px 24px; color: #e0e0f0;">
            <p style="font-size: 16px; margin: 0 0 16px;">Dear <strong style="color: #a855f7;">' . htmlspecialchars($participantName) . '</strong>,</p>
            <p style="margin: 0 0 16px;">You have registered successfully for:</p>
            
            <!-- Competition box -->
            <div style="background: rgba(124,58,237,0.15); border: 1px solid rgba(168,85,247,0.4); border-radius: 12px; padding: 18px; text-align: center; margin: 16px 0;">
                <span style="font-size: 22px; font-weight: 700; color: #a855f7;">🏆 ' . htmlspecialchars($competitionName) . '</span>
            </div>';

    // Show team members if applicable
    if ($teamMembers !== 'N/A' && !empty($teamMembers)) {
        $mail->Body .= '
            <div style="background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 10px; padding: 14px; margin: 16px 0;">
                <p style="margin: 0; font-size: 13px; color: #06b6d4; font-weight: 600;">👥 Team Members:</p>
                <p style="margin: 6px 0 0; font-size: 14px; color: #c0c0e0;">' . htmlspecialchars($teamMembers) . '</p>
            </div>';
    }

    $mail->Body .= '
            <p style="margin: 16px 0 0;">Thank you for registering. We look forward to seeing you at the event!</p>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
            <p style="color: #8a8aaa; font-size: 12px; text-align: center; margin: 0;">
                ITECA\'27 Organizing Committee<br/>
                Inter-College Symposium 2027
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #111128; padding: 14px; border-radius: 0 0 16px 16px; text-align: center;">
            <p style="color: #6a6a8a; font-size: 11px; margin: 0;">This is an automated email. Please do not reply.</p>
        </div>
    </div>';

    // --- Send! ---
    $mail->send();

    // Success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Email sent successfully to ' . $recipientEmail
    ]);

} catch (Exception $e) {
    // Error response
    echo json_encode([
        'status' => 'error',
        'message' => 'Email could not be sent. Error: ' . $mail->ErrorInfo
    ]);
}
?>
