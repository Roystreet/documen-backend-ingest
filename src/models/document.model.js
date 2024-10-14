module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bucketName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    objectName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: {
        model: 'companies', 
        key: 'id'
      }
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'documents'
  });

  Document.associate = (models) => {
    // Relación: Un documento está asociado a un usuario (quien lo subió)
    Document.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader'
    });

    // Relación: Un documento puede tener varios chats
    Document.hasMany(models.Chat, {
      foreignKey: 'documentId',
      as: 'chats'
    });

    Document.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
  };

  return Document;
};
