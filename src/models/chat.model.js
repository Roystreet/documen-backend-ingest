module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      documentId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'documents',
          key: 'id'
        }
      },
      createdBy: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'chats'
    });
  
    Chat.associate = (models) => {
      // Relación: Un chat está asociado a un documento
      Chat.belongsTo(models.Document, {
        foreignKey: 'documentId',
        as: 'document'
      });
  
      // Relación: Un chat tiene varios mensajes
      Chat.hasMany(models.ChatMessage, {
        foreignKey: 'chatId',
        as: 'messages'
      });
    };
  
    return Chat;
  };
  