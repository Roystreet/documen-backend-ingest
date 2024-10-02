const { uploadFileBuffer } = require('../tools/uploadFile')
const { Document } = require('../models');
const fs = require('fs');
const logger = require('../middlewares/logger');

exports.uploadDocument = async (req, res) => {
    try {
      const { file } = req;
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
        url: url,
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