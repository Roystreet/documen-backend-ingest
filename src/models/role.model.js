module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      roleName: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'roles'
    });
  
    Role.associate = (models) => {
      // Relación: Un rol puede pertenecer a varios usuarios
      Role.belongsToMany(models.User, {
        through: 'UserRole',
        foreignKey: 'roleId',
        as: 'users'
      });
    };
  
    return Role;
  };
  