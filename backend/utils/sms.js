const twilio = require('twilio');

let twilioClient = null;

const initTwilio = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
    return true;
  }
  return false;
};

const sendSMS = async (to, message) => {
  if (!twilioClient) {
    const initialized = initTwilio();
    if (!initialized) {
      // Dev mode: Twilio not configured, "send" by logging to console
      // Return success so the flow continues, and include devMode flag so
      // the caller can surface the code to the user for testing.
      console.log('\n========================================');
      console.log('📱 SMS (DEV MODE - Twilio not configured)');
      console.log('   To:', to);
      console.log('   Message:', message);
      console.log('========================================\n');
      return { success: true, devMode: true };
    }
  }

  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

const sendMFACode = async (phoneNumber, code) => {
  const message = `Your Hockey Coach Pro verification code is: ${code}. Valid for 5 minutes.`;
  const result = await sendSMS(phoneNumber, message);
  if (result.devMode) {
    result.code = code;
  }
  return result;
};

module.exports = {
  sendSMS,
  sendMFACode,
  initTwilio
};
