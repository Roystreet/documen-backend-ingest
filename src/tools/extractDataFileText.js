const fs = require('fs');
const pdfParse = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
 async function extractDataFileText() {
  // Cargar el archivo PDF
  const pdfBuffer = fs.readFileSync('temp/prueba.pdf');
  const data = await pdfParse(pdfBuffer);
  const contentText = data.text;
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap:0,
  });
  const splitText = await textSplitter.splitText(contentText);

  console.log(splitText);
}

extractDataFileText().catch(console.error);