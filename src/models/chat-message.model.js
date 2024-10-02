module.exports = (sequelize, DataTypes) => {
    const ChatMessage = sequelize.define('ChatMessage', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      chatId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'chats',
          key: 'id'
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'chat_messages'
    });
  
    ChatMessage.associate = (models) => {
      // Relación: Un mensaje pertenece a un chat
      ChatMessage.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat'
      });
  
      // Relación: Un mensaje pertenece a un usuario
      ChatMessage.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'sender'
      });
    };
  
    return ChatMessage;
  };
  