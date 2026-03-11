import nodemailer from 'nodemailer';
import transporter from '../config/nodemailer.js';

/**
 * Email Notification Service
 * PRD Section 7.3 - Notification Services (SendGrid integration)
 */

/**
 * Get viewing confirmation email template
 */
const getViewingConfirmationTemplate = (viewing) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #00796B 0%, #009688 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Viewing Confirmed! 🏠</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${viewing.userName},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Great news! Your property viewing has been confirmed.
      </p>
      
      <!-- Property Card -->
      <div style="background: #f8f8f8; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #00796B; margin: 0 0 15px 0; font-size: 20px;">${viewing.propertyTitle}</h3>
        <p style="color: #666; margin: 0 0 10px 0;">📍 ${viewing.propertyLocation}</p>
        <p style="color: #666; margin: 0 0 10px 0;">📅 ${viewing.date}</p>
        <p style="color: #666; margin: 0 0 10px 0;">⏰ ${viewing.timeSlot}</p>
        <p style="color: #666; margin: 0;">🏷️ ${viewing.type} Viewing</p>
      </div>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Please arrive 5 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${process.env.WEBSITE_URL}/dashboard" 
           style="background: linear-gradient(135deg, #00796B 0%, #009688 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          View My Bookings
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 25px 30px; text-align: center;">
      <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
        © ${new Date().getFullYear()} Jona Crest Properties. All rights reserved.
      </p>
      <p style="color: #999; font-size: 12px; margin: 0;">
        Accra, Ghana 🇬🇭
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Get service request confirmation template
 */
const getServiceRequestTemplate = (request) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1976D2 0%, #2196F3 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Service Request Received 📦</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi ${request.userName},
      </p>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        We've received your ${request.serviceType} service request. Our team will contact you shortly.
      </p>
      
      <!-- Service Details -->
      <div style="background: #f8f8f8; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
        <h3 style="color: #1976D2; margin: 0 0 15px 0; font-size: 20px;">${request.serviceType} Service</h3>
        <p style="color: #666; margin: 0 0 10px 0;">📍 Location: ${request.location}</p>
        <p style="color: #666; margin: 0 0 10px 0;">📅 Preferred Date: ${request.date}</p>
        <p style="color: #666; margin: 0 0 10px 0;">📝 Details: ${request.details || 'Not specified'}</p>
        <p style="color: #666; margin: 0;">📱 Contact: ${request.phone}</p>
      </div>
      
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Reference Number: <strong>#${request.id}</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f5f5f5; padding: 25px 30px; text-align: center;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} Jona Crest Properties
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send viewing confirmation email
 */
export const sendViewingConfirmation = async (viewing) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: viewing.userEmail,
      subject: '✅ Viewing Confirmed - Jona Crest Properties',
      html: getViewingConfirmationTemplate(viewing),
    };

    await transporter.sendMail(mailOptions);
    console.log('Viewing confirmation email sent to:', viewing.userEmail);
    return true;
  } catch (error) {
    console.error('Error sending viewing confirmation:', error);
    return false;
  }
};

/**
 * Send service request confirmation email
 */
export const sendServiceRequestConfirmation = async (request) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: request.userEmail,
      subject: '📦 Service Request Received - Jona Crest Properties',
      html: getServiceRequestTemplate(request),
    };

    await transporter.sendMail(mailOptions);
    console.log('Service request email sent to:', request.userEmail);
    return true;
  } catch (error) {
    console.error('Error sending service confirmation:', error);
    return false;
  }
};

/**
 * Send landlord notification about new viewing request
 */
export const notifyLandlordNewViewing = async (landlordEmail, viewing) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: landlordEmail,
      subject: '🏠 New Viewing Request - Action Required',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Viewing Request</h2>
          <p>You have a new viewing request for <strong>${viewing.propertyTitle}</strong></p>
          <ul>
            <li>Requested by: ${viewing.userName} (${viewing.userEmail})</li>
            <li>Date: ${viewing.date}</li>
            <li>Time: ${viewing.timeSlot}</li>
            <li>Type: ${viewing.type}</li>
          </ul>
          <p><a href="${process.env.WEBSITE_URL}/landlord">Go to Dashboard to Approve/Decline</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error notifying landlord:', error);
    return false;
  }
};

export default {
  sendViewingConfirmation,
  sendServiceRequestConfirmation,
  notifyLandlordNewViewing,
};
