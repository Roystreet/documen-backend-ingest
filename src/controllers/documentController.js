const { uploadFileBuffer } = require('../tools/uploadFile')
const { Document } = require('../models');
const fs = require('fs');
const logger = require('../middlewares/logger');
const PineconeClient = require('../tools/pineconeClient');
const indexName = process.env.PINECONE_INDEX;
const { OpenAIEmbeddings, OpenAI } = require("@langchain/openai");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const apiKey_openai = process.env.OPENAI_API_KEY;
const { PineconeStore } = require("@langchain/pinecone");
const { PromptTemplate } = require("@langchain/core/prompts");

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    console.log(req.body);
    console.log(file);
    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const bucketName = process.env.MINIO_BUCKET;
    const objectName = `${Date.now()}_${file.originalname}`;
    const contentType = file.mimetype;

    // Lee el archivo como un buffer
    const buffer = fs.readFileSync(file.path);

    // Sube el archivo a MinIO y obtiene la URL directa
    const url = await uploadFileBuffer(buffer, bucketName, objectName, contentType);

    // Guarda la ruta del archivo en la base de datos
    const document = await Document.create({
      name: file.originalname,
      filePath: `${bucketName}/${objectName}`,
      bucketName: bucketName,
      objectName: objectName,
      companyId: req.body.companyId,
    });

    const index = PineconeClient.Index(indexName);

    // 2. Carga y divide el documento
    let docs = [];

    // Verifica el tipo de archivo y utiliza el loader adecuado
    if (file.mimetype === 'text/plain') {
      // Si es un archivo de texto plano
      const text = buffer.toString('utf-8');

      // Crea un splitter para dividir el texto en fragmentos manejables
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,     // Tamaño de cada fragmento
        chunkOverlap: 200,   // Superposición entre fragmentos
      });

      // Divide el texto en documentos
      docs = await textSplitter.createDocuments([text]);
    } else if (file.mimetype === 'application/pdf') {


      // Crea un loader para cargar el PDF
      const loader = new PDFLoader(file.path, {
        splitPages: false
      });

      // Carga y divide el PDF en documentos
      docs = await loader.load();
    } else {
      // Si el tipo de archivo no es soportado
      return res.status(400).json({ error: 'Tipo de archivo no soportado para vectorización' });
    }
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey_openai, // Clave de API de OpenAI
      configuration: {}
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: document.id.toString(), // Utiliza el ID del documento como namespace
    });

    res.status(201).json(document);
    console.log('Documento subido exitosamente');
  } catch (error) {
    console.log('Error al subir documento:', error);
    res.status(500).json({ error: 'Error al subir documento', message: error.message });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    res.status(200).json(document);
    logger.info('Documento obtenido exitosamente');
  } catch (error) {
    logger.error('Error al obtener documento:', error);
    res.status(500).json({ error: 'Error al obtener documento' });
  }
};

exports.getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll();
    res.status(200).json(documents);
    logger.info('Documentos obtenidos exitosamente');
  } catch (error) {
    logger.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

exports.deleteDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Elimina el archivo de MinIO
    const [bucketName, objectName] = document.path.split('/');
    await minioClient.removeObject(bucketName, objectName);

    // Elimina el registro de la base de datos
    await document.destroy();

    res.status(200).json({ message: 'Documento eliminado exitosamente' });
    logger.info('Documento eliminado exitosamente');
  } catch (error) {
    logger.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
};

exports.answerQuery = async (req, res) => {
  const { query, documentId } = req.body;

  if (!query || !documentId) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (query, documentId)' });
  }

  const index = PineconeClient.Index(indexName);

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: apiKey_openai, // Clave de API de OpenAI
  });

  // Crea el vector store basado en el índice existente y el namespace del documento
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
    namespace: documentId.toString(), // Usa el ID del documento como namespace
  });

  // Realiza la búsqueda de similitud en los embeddings
  const results = await vectorStore.similaritySearch(query, 3);

  // Combina el contenido de los documentos relevantes
  const context = results.map(doc => doc.pageContent).join('\n');
  console.log(context)
  const model = new OpenAI({
    apiKey: apiKey_openai,
    model: "gpt-4o",
    temperature: 0,
  });

  const createTemplate = require("../prompt-template/messageDocumentTemplate");
  const prompt = createTemplate(context, query);
  const response = await model.invoke(prompt);
  res.json({ response: response});
}