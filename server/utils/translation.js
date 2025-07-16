const translate = require('@vitalets/google-translate-api');

const translateMessage = async (text, targetLanguage) => {
  try {
    const result = await translate(text, { to: targetLanguage });
    return result.text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

module.exports = { translateMessage };