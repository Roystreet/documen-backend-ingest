/*require('dotenv').config();
const fs = require('fs');
const { OpenAIEmbeddings } = require("@langchain/openai");
const pdfParse = require("pdf-parse"); // Peer dep
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { load } = require('langchain/load');
const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.API_KEY
});


const loader = new PDFLoader("../temp/prueba.pdf");

console.log(loader);
(async () => {
    
   
     try {
        const docs = await loader.load();
        console.log(docs.length);
        console.log(docs);
       //const res = await embeddings.embedQuery("Hello world");
       //console.log(res);
     } catch (error) {
      // console.error("Error embedding query:", error);
     }
       
})();
*/
const fs = require('fs');
const pdfParse = require('pdf-parse');

async function leerPDF() {
  // Cargar el archivo PDF
  const pdfBuffer = fs.readFileSync('temp/prueba.pdf');
  
  // Parsear el documento PDF
  const data = await pdfParse(pdfBuffer);
  
  // Obtener el número de páginas
  const numPages = data.numpages;
  console.log(`El PDF tiene ${numPages} páginas.`);

  // Leer el contenido de cada página
  console.log('Contenido del PDF:');
  console.log(data.text);
}

leerPDF().catch(console.error);