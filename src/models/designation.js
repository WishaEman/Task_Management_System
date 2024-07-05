module.exports = (sequelize, DataTypes) => {

    const Designation = sequelize.define('Designation', {
        title: {
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
    
    Designation.associate = function(models) {
        Designation.hasMany(models.User, { foreignKey: 'designationId', as: 'users' });
    };

    return Designation;
}
