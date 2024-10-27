const { uploadFileBuffer } = require('../tools/uploadFile')
const { Document } = require('../models');
const fs = require('fs');
const logger = require('../middlewares/logger');
const PineconeClient = require('../tools/pineconeClient');
const indexName = process.env.PINECONE_INDEX;
const { OpenAIEmbeddings, ChatOpenAI } = require("@langchain/openai");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const apiKey_openai = process.env.OPENAI_API_KEY;
const { PineconeStore } = require("@langchain/pinecone");
const { PromptTemplate } = require("@langchain/core/prompts");

exports.uploadDocument = async (req, res) => {
  try {
    const { file } = req;
    const { companyId } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'El campo companyId es requerido' });
    }

    const bucketName = process.env.MINIO_BUCKET;
    const objectName = `${Date.now()}_${file.originalname}`;
    const contentType = file.mimetype;

    const buffer = fs.readFileSync(file.path);

    const url = await uploadFileBuffer(buffer, bucketName, objectName, contentType);

    const document = await Document.create({
      name: file.originalname,
      filePath: `${bucketName}/${objectName}`,
      bucketName: bucketName,
      objectName: objectName,
      companyId: companyId,
    });

    const index = PineconeClient.Index(indexName);

    let docs = [];

    if (file.mimetype === 'text/plain') {
      const text = buffer.toString('utf-8');
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      docs = await textSplitter.createDocuments([text]);
    } else if (file.mimetype === 'application/pdf') {
      const loader = new PDFLoader(file.path, { splitPages: true });
      docs = await loader.load();
    } else {
      return res.status(400).json({ error: 'Tipo de archivo no soportado para vectorización' });
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: apiKey_openai,
      configuration: {}
    });

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: document.id.toString(),
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
  const { companyId } = req.body;
  try {
    const documents = await Document.findAll({ where: { companyId: companyId } });
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

  try {
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

    // Configurar las cabeceras para streaming
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Necesario para evitar problemas con CORS si aplicas políticas estrictas
    res.flushHeaders();

    const createTemplate = require("../prompt-template/messageDocumentTemplate");
    const prompt = createTemplate(context, query);

    const model = new ChatOpenAI({
      apiKey: apiKey_openai,
      modelName: "gpt-4o-mini", // Asegúrate de usar un modelo compatible con streaming
      temperature: 0,
      streaming: true,
    });

    let stream = await model.stream(prompt);
    for await (const data of stream) {
      res.write(`data: ${data.content}\n\n`);
    }
    res.end();
  } catch (error) {
    console.error('Error en answerQuery:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al procesar la consulta', message: error.message });
    } else {
      res.end();
    }
  }
};

exports.updateNameDocument = async (req, res) => {
  const { id, name } = req.body;
  try {
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    document.name = name;
    await document.save();

    res.status(200).json(document);
    logger.info('Nombre de documento actualizado exitosamente');
  } catch (error) {
    logger.error('Error al actualizar nombre de documento:', error);
    res.status(500).json({ error: 'Error al actualizar nombre de documento' });
  }
}