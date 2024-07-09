const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Email address already in use!'
            },
            validate: {
                isEmail: true,
                notEmpty: true,
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        designationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Designation',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        managerId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'User',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
    }, {
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.password && user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
        getterMethods: {
            fullName() {
                return `${this.firstName} ${this.lastName}`;
            }
        },
    });

    User.associate = function(models) {
        User.belongsTo(models.Designation, { foreignKey: 'designationId', as: 'designation' });
        User.belongsTo(models.User, { foreignKey: 'managerId', as: 'manager' });
        User.hasMany(models.User, { foreignKey: 'managerId', as: 'subordinates' });
        User.hasMany(models.Notification, { foreignKey: 'userId', as: 'notifications' });
        User.hasMany(models.Task, {foreignKey: 'assignedTo', as: 'assignedTasks' });
        User.belongsToMany(models.Product, {
            through: models.UserProduct,
            as: 'products',
            foreignKey: 'userId',
            otherKey: 'productId'
        });
    };

    return User;
};
