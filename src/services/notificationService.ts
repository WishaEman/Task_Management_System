const db = require('@models/index');
const Notification = db.Notification;
const { Op } = require('sequelize');

type NotificationInstance = InstanceType<typeof Notification>;

export class NotificationService {
  async getAllNotifications(page: number, pageSize: number, userId?: number, date?: Date): Promise<{ notifications: NotificationInstance[], count: number }> {
    const offset = (page - 1) * pageSize;

    const whereConditions: any = {};
    if (userId) {
      whereConditions.userId = userId;
    }
    if (date) {
      whereConditions.createdAt = {
        [Op.lte]: date,
      };
    }
    const { rows: notifications, count } = await Notification.findAndCountAll({
      where: whereConditions,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    return { notifications, count };
  }
}