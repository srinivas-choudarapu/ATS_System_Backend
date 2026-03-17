const { PDFParse } = require('pdf-parse');

const extractTextFromPDF = async (text) => {
  const parser = new PDFParse({ url: text });

	const result = await parser.getText();
	// console.log(result.text);
	return result.text;
};

module.exports = extractTextFromPDF;