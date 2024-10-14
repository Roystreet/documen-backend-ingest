const createTemplate = (context, question) => {
    return `Eres un asistente virtual experto en el tema.
  Responde a la siguiente pregunta de manera clara, concisa y amigable, utilizando la información que tienes disponible. Si no tienes todos los detalles, proporciona una respuesta útil y sugiere acciones o pasos adicionales que el usuario pueda tomar para obtener más información.
  
  Información disponible:
  ${context}
  
  Pregunta:
  ${question}
  
  Respuesta:`;
};


module.exports = createTemplate;