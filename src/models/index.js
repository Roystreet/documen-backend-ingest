const { DataTypes } = require('sequelize');
const sequelize  = require('../config/db');

// Cargar los modelos
const Role = require('./role.model')(sequelize, DataTypes);
const Company = require('./company.model')(sequelize, DataTypes);
const Document = require('./document.model')(sequelize, DataTypes);
const Chat = require('./chat.model')(sequelize, DataTypes);
const ChatMessage = require('./chat-message.model')(sequelize, DataTypes);
const User = require('./user.model')(sequelize, DataTypes);
const UserRole = require('./user-role.model')(sequelize, DataTypes);


// Asociaciones (Relaciones)
Role.associate({ User, UserRole });
Company.associate({ User });
Document.associate({ User, Chat });
Chat.associate({ Document, ChatMessage });
ChatMessage.associate({ Chat, User });
User.associate({ Role, UserRole, Company, Document, ChatMessage });

module.exports = {
    sequelize,
    User,
    Role,
    UserRole,
    Company,
    Document,
    Chat,
    ChatMessage,
};