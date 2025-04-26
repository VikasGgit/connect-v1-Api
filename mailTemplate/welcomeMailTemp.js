const welcomemail = (user) => (`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(45deg, #6a5acd, #1e90ff);
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
        }
        .email-body {
            padding: 20px;
            text-align: center;
            color: #333;
        }
        .email-body p {
            font-size: 16px;
            line-height: 1.5;
            margin: 15px 0;
        }
        .email-body .username {
            font-weight: bold;
            color: #6a5acd;
        }
        .email-footer {
            background-color: #f4f4f4;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Welcome to Connect</h1>
        </div>
        <div class="email-body">
            <p>Hi <span class="username">${user}</span>,</p>
            <p>We're thrilled to have you join us! Get ready to explore, connect, and grow with our vibrant community.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out. We're here to support you every step of the way!</p>
        </div>
        <div class="email-footer">
            &copy; 2025 Connect. All rights reserved.
        </div>
    </div>
</body>
</html>`);
module.exports = welcomemail;