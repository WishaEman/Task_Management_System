module.exports = (sequelize, DataTypes) => {

    const Product = sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNUll: true,
        },
    });
    
    Product.associate = function(models) {
        Product.associate = function(models) {
            Product.belongsToMany(models.User, {
                through: models.UserProduct,
                as: 'users',
                foreignKey: 'productId',
                otherKey: 'userId'
            });
        };
    };

    return Product;
}
