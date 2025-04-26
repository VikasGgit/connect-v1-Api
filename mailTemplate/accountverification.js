const otpMailTemp = (otp) => {
 return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification OTP</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }

        .header {
            background-color: #6c63ff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
        }

        .content {
            padding: 20px;
            text-align: center;
        }

        .content p {
            margin: 15px 0;
            font-size: 16px;
        }

        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #6c63ff;
            margin: 20px 0;
        }

        .footer {
            background-color: #f1f1f1;
            padding: 10px 20px;
            font-size: 14px;
            text-align: center;
            color: #777;
        }

        .footer a {
            color: #6c63ff;
            text-decoration: none;
        }

        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <span>Connect</span>
            <p style="margin: 0; font-size: 16px;">Connect with Growth - by Adarsh Srivastava</p>
        </div>
        <div class="content">
            <p>Hi,</p>
            <p>Your One-Time Password (OTP) for email verification is:</p>
            <div class="otp"> ${otp} </div>
            <p>Please use this code to complete your verification process. This OTP is valid for the next 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Thank you for joining us!<br>The Connect Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 Connect. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@connect.com">Contact Support</a></p>
        </div>
    </div>
</body>

</html>`;
};
module.exports = otpMailTemp;
