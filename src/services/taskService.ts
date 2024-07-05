const db = require('@models/index');
const Task = db.Task;
const ServerPort = db.serverPort;
const Product =  db.Product;
const UserProduct= db.UserProduct;

type TaskInstance = InstanceType<typeof Task>;

export class TaskService {
  async createTask(data: any): Promise<TaskInstance> {
    if (!data.createdBy) {
      throw new Error('CreatedBy is required');
    }

  // Check if the product ID is valid
  const product = await Product.findByPk(data.productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Check if the user creating the task is associated with the project
  const userProduct = await UserProduct.findOne({
    where: {
      userId: data.createdBy,
      productId: data.productId,
    },
  });
  if (!userProduct) {
    throw new Error('User is not part of the project associated with the product');
  }

    const task = await Task.create(data);
    return task;
  }

  async getTaskById(id: number): Promise<TaskInstance | null> {
    return Task.findByPk(id, {
      include: ['creator', 'assignee', 'product', 'parentTask', 'subTasks', 'logs', 'notifications', 'serverPort'],
    });
  }
}
