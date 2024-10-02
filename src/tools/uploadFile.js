require('dotenv').config();
const Minio = require('minio');
const fs = require('fs');

// Configura el cliente de MinIO
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_URL,
  port: 9000,
  useSSL: false,  // Cambia a true si usas HTTPS
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_ACCES_SECRET_KEY,
});

// Función para subir el archivo desde un buffer y generar la URL
const subirArchivoDesdeBuffer = async (buffer, bucketName, objectName, contentType) => {
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

    // Genera una URL presigned (con un tiempo de expiración por defecto)
    const presignedUrl = await minioClient.presignedGetObject(bucketName, objectName);
    console.log(`URL presigned del archivo: ${presignedUrl}`);

    return presignedUrl; // Retorna la URL
  } catch (err) {
    console.error('Error subiendo el archivo:', err);
    throw err;
  }
};

// Llama a la función para subir el archivo y obtener la URL
const filePath = 'temp/prueba.pdf';  // Ruta del archivo local
const buffer = fs.readFileSync(filePath);  // Lee el archivo como un buffer
const bucketName = process.env.MINIO_BUCKET; // Nombre del bucket
const objectName = 'documento.pdf'; // Nombre del archivo en el bucket
const contentType = 'application/pdf'; // Tipo de contenido del archivo

subirArchivoDesdeBuffer(buffer, bucketName, objectName, contentType)
  .then((url) => console.log('Archivo accesible en:', url))
  .catch((err) => console.error('Error:', err));
