const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: 'gemini-pro' }); // Just to get the instance
    // The SDK doesn't have a direct listModels, but we can try to see what works
    console.log('Testing gemini-pro...');
    const result = await models.generateContent('test');
    console.log('gemini-pro works');
  } catch (e) {
    console.log('gemini-pro failed:', e.message);
  }
}

listModels();
