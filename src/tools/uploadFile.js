require('dotenv').config();
const Minio = require('minio');
const fs = require('fs');

// Configura el cliente de MinIO
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  port: 9000,
  useSSL: false,  // Cambia a true si usas HTTPS
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Función para subir el archivo desde un buffer y generar la URL
const uploadFileBuffer = async (buffer, bucketName, objectName, contentType) => {
  try {
    // Verifica si el bucket existe
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      console.log(`El bucket ${bucketName} no existe.`);
      return;
    }

    // Sube el archivo desde el buffer a MinIO
    await minioClient.putObject(bucketName, objectName, buffer, buffer.length, {
      'Content-Type': contentType,  // Especifica el tipo de contenido
    });
    console.log(`Archivo ${objectName} subido correctamente al bucket ${bucketName}.`);

    // Genera una URL directa al archivo
    const url = minioClient.getObjectUrl(bucketName, objectName);
    console.log(`URL del archivo: ${url}`);

    return url; // Retorna la URL
  } catch (err) {
    
    console.log('Error subiendo el archivo en el metodo uploadFIleBuffer:', err);
    throw err;
  }
};

module.exports = {
  minioClient,
  uploadFileBuffer,
};