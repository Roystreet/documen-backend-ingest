module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      roleId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'roles',
          key: 'id'
        }
      }
    }, {
      tableName: 'user_roles',
      timestamps: false
    });
  
    return UserRole;
  };
  