const cron = require('node-cron');
const db = require('./src/models/index');
const { Op } = require('sequelize');

cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running the notification job...');

    const tomorrow = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 0, 0, 0, 0));
    const endOfTomorrow = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1, 23, 59, 59, 999));
    console.log(tomorrow);
    console.log(endOfTomorrow);

    const upcomingTasks = await db.Task.findAll({
      where: {
        deadline: {
            [Op.between]: [tomorrow, endOfTomorrow]
        },
        status: 'In Progress',
      },
    });
    for (const task of upcomingTasks) {
      const { title, deadline, id , assignedTo} = task;
      await db.Notification.create({
        message: `Reminder: The deadline for the task "${title}" is  (${deadline.toLocaleDateString()}). Please make sure to complete it on time.`,
        userId: assignedTo,
        routePath: `/tasks/${id}`
      });
    }

    console.log('Notification job completed successfully.');

  } catch (error) {
    console.error('Error running the notification job:', error);
  }
});
