module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM,
            values: ['backlog', 'In Progress', 'In QA', 'Done'],
            allowNull: false,
            defaultValue: 'backlog',
        },
        precedence: {
            type: DataTypes.ENUM,
            values: ['hot', 'medium', 'low'],
            allowNull: false,
            defaultValue: 'medium',
        },
        estimate: {
            type: DataTypes.INTEGER, // Number of days
            allowNull: true,
        },
        branchName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        serverPortId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'ServerPort',
                key: 'id',
            },
            allowNull: true,
        },
        productId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Product',
                key: 'id',
            },
            allowNull: false,
        },
        parentTaskId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Task',
                key: 'id',
            },
            allowNull: true,
        },
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'id',
            },
            allowNull: true,
        },
        assignedTo: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'id',
            },
            allowNull: true,
        },
    }, {
        hooks: {
            afterCreate: async (task, options) => {
                // Log task creation
                await sequelize.models.TaskLog.create({
                    taskId: task.id,
                    previousState: 'backlog',
                    currentState: task.status,
                });
            },
            afterUpdate: async (task, options) => {
                const previousState = task.previous('status');
                const currentState = task.status;

                if (previousState !== currentState) {
                    // Log status change
                    await sequelize.models.TaskLog.create({
                        taskId: task.id,
                        status: currentState,
                        previousState: previousState,
                        currentState: currentState,
                    });

                    // Free the server port if task status is 'Done'
                    if (currentState === 'Done' && task.serverPortId) {
                        const port = await task.getServerPort();
                        if (port) {
                            port.status = 'available';
                            await port.save();
                        }
                    }
                }
            }
        }
    });

    Task.associate = function(models) {
        Task.belongsTo(models.ServerPort, { foreignKey: 'serverPortId', as: 'serverPort' });
        Task.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
        Task.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'assignee' });
        Task.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
        Task.belongsTo(models.Task, { foreignKey: 'parentTaskId', as: 'parentTask' });
        Task.hasMany(models.Task, { foreignKey: 'parentTaskId', as: 'subTasks' });
        Task.hasMany(models.TaskLog, { foreignKey: 'taskId', as: 'logs' });
        Task.hasMany(models.Notification, { foreignKey: 'taskId', as: 'notifications' });
    };

    return Task;
};
