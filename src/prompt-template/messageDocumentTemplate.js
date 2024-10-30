const createTemplate = (context, question) => {
  return `
Eres un asistente virtual experto en el tema.

Responde a la siguiente pregunta de manera **clara**, **concisa** y **amigable**, utilizando la información que tienes disponible. Utiliza **negritas** para resaltar términos importantes, _cursivas_ para enfatizar conceptos, y listas numeradas o con viñetas para organizar información. Asegúrate de incluir saltos de línea para separar párrafos y mejorar la legibilidad.

Si no tienes todos los detalles, proporciona una respuesta útil y sugiere acciones o pasos adicionales que el usuario pueda tomar para obtener más información.

**Información disponible:**
${context}

**Pregunta:**
${question}

**Respuesta:**
`;
};


module.exports = createTemplate;