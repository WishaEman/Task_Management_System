module.exports = (sequelize, DataTypes) => {

    const UserProduct = sequelize.define('UserProduct', {
        userId:  { 
            type: DataTypes.INTEGER, 
            allowNull: false,
            references: { 
                model: 'User',
                key: 'id'
            }
        },
        productId: {
             type: DataTypes.INTEGER,
             allowNull: false,
             unique: {
                args: true,
                msg: 'User Already enrolled in this product!'
            },
             references: {
                model: 'Product',
                key: 'id' 
            }
        },
    });

    UserProduct.associate = function(models) {
        UserProduct.belongsTo(models.User, { foreignKey: 'userId' });
        UserProduct.belongsTo(models.Product, { foreignKey: 'productId' });
    };
    return UserProduct;
};
