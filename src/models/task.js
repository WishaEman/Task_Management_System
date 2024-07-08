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
            type: DataTypes.STRING,
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
            afterUpdate: async (task, options) => {
                if (options.hook === false) return; // Skip hook logic if not triggered by the hook itself

                if (task.changed('assignedTo')) {
                    const userId = task.assignedTo;
                    if (userId) {
                        await sequelize.models.Notification.create({
                            message: `Task ${task.title} has been assigned to you.`,
                            userId: userId,
                            routePath: `/tasks/${task.id}`
                        });

                        // Assign a server port to the task
                        const availablePort = await sequelize.models.ServerPort.findOne({
                            where: { status: 'available' },
                            order: [['portNumber', 'ASC']]
                        });

                        if (availablePort) {
                            // Disable hook logic for this update to prevent recursion
                            await task.update({ serverPortId: availablePort.id }, { hook: false });
                            await availablePort.update({ status: 'assigned' });
                        }
                    }
                }

                if (task.changed('status')) {
                    const previousState = task.previous('status');
                    const currentState = task.status;

                    if (previousState !== currentState) {
                        await sequelize.models.TaskLog.create({
                            taskId: task.id,
                            previousState: previousState,
                            currentState: currentState,
                            changedAt: new Date()
                        });

                        // Free the server port if the status changes to 'Done'
                        if (currentState === 'Done') {
                            const serverPort = await sequelize.models.ServerPort.findOne({
                                where: { id: task.serverPortId }
                            });

                            if (serverPort) {
                                await serverPort.update({ status: 'available' });
                                await task.update({ serverPortId: null }, { hook: false });
                            }
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
    };

    return Task;
};
