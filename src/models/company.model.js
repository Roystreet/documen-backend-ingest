module.exports = (sequelize, DataTypes) => {
    const Company = sequelize.define('Company', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      logo:{
        type: DataTypes.STRING,
        allowNull: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
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
      tableName: 'companies'
    });
  
    Company.associate = (models) => {
      // Relación: Una empresa puede tener muchos usuarios
      Company.hasMany(models.User, {
        foreignKey: 'companyId',
        as: 'users'
      });
    };
  
    return Company;
  };
  