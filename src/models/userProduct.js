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
             references: {
                model: 'Product',
                key: 'id' 
            }
        },
    }, {
        timestamps: true,
        // Define composite primary key
        primaryKey: ['userId', 'productId'],
    });

    UserProduct.associate = function(models) {
        UserProduct.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        UserProduct.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    };
    
    return UserProduct;
};
