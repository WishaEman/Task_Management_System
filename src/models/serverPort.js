module.exports = (sequelize, DataTypes) => {
    const ServerPort = sequelize.define('ServerPort', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        portNumber: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'available',
            validate: {
                isIn: [['available', 'assigned']],
            },
        },
    });

    ServerPort.associate = function(models) {
        ServerPort.hasOne(models.Task, { foreignKey: 'serverPortId', as: 'task' });
    };

    return ServerPort;
};
