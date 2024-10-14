module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Un usuario puede o no estar asociado a una empresa
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'users'
  });

  User.associate = (models) => {
    // Relación: Un usuario pertenece a una empresa
    User.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });

    // Relación: Un usuario puede tener varios roles
    User.belongsToMany(models.Role, {
      through: 'UserRole',
      foreignKey: 'userId',
      as: 'roles'
    });

    // Relación: Un usuario puede crear documentos
    User.hasMany(models.Document, {
      foreignKey: 'uploadedBy',
      as: 'documents'
    });

    // Relación: Un usuario puede enviar varios mensajes en el chat
    User.hasMany(models.ChatMessage, {
      foreignKey: 'userId',
      as: 'messages'
    });
  };

  return User;
};
