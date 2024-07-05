module.exports = (sequelize, DataTypes) => {
    const TaskLog = sequelize.define('TaskLog', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
      },
      previousState: {
        type: DataTypes.ENUM,
        values: ['backlog', 'In Progress', 'In QA', 'Done'],
        allowNull: false,
      },
      currentState: {
        type: DataTypes.ENUM,
        values: ['backlog', 'In Progress', 'In QA', 'Done'],
        allowNull: false,
      },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, {
      timestamps: false,
    });
  
    TaskLog.associate = function(models) {
      TaskLog.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    };
  
    return TaskLog;
};
  