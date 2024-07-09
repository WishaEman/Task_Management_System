const db = require('@models/index');
const Task = db.Task;
const { Op } = require('sequelize');

type TaskInstance = InstanceType<typeof Task>;
type UserProductInstance = InstanceType<typeof db.UserProduct>;
type UserInstance = InstanceType<typeof db.User>;

interface GetTasksQuery {
  assignedTo?: number; 
  precedence?: 'hot' | 'medium' | 'low';
  status?: 'To Do/backlog' | 'In Progress' | 'In QA' | 'Done'; 
  deadline?: Date; 
  productId?: number;
  id?: number;
  page?: number;
  pageSize?: number;
  includeProducts?: boolean;
  includeCreator?: boolean;
  includeLogs?: boolean;
  includeAssigneeDetails?: boolean;
}


interface UserTaskSummary {
  userId: number;
  name: string;
  taskCounts: {
      total: number;
      backlog: number;
      inProgress: number;
      inQA: number;
      done: number;
  };
}

type UserAttributes =  {
  id: number;
  firstName: string;
  assignedTasks?: TaskAttributes[];
}


type TaskAttributes = {
  id: number;
  status: 'backlog' | 'In Progress' | 'In QA' | 'Done';
}

export class TaskService {

  async createTask(data: Partial<TaskInstance>, userId: number, productId: number): Promise<TaskInstance> {
    // Check if the user ID is valid
    const user = await db.User.findByPk(userId);
    if(!user) throw new Error('User not found');
    // Check if the product ID is valid
    const product = await db.Product.findByPk(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if the user creating the task is associated with the project
    const userProduct = await db.UserProduct.findOne({
      where: {
        userId: userId,
        productId: productId,
      },
    });
    if (!userProduct) {
      throw new Error('User is not part of the product so cannot make a task');
    }
    const taskData = {
      ...data,
      createdBy: userId,
      productId: productId,
    };
    const task = await Task.create(taskData);
    return task;
  }
  
  async getTaskById(id: number): Promise<TaskInstance | null> {
    return Task.findByPk(id, {
      include: ['product'],
    });
  }

  async assignTaskAutomatically() {
    const users = await db.User.findAll();
    const tasks = await Task.findAll({
        where: {
            status: 'backlog',
            precedence: {
                [Op.or]: ['hot', 'medium', 'low']
            }
        },
        order: [['precedence', 'ASC']] 
    });
    if (tasks.length === 0) {
      return {
          status: 404,
          message: 'No tasks are in the backlog'
      };
  }
    const userProductAssociations = await db.UserProduct.findAll();

   // Create a map of productId to users eligible to work on that product
   const productUsersMap: { [key: string]: number[] } = userProductAssociations.reduce((acc: { [key: string]: number[] }, association: UserProductInstance )=> {
      if (!acc[association.productId]) {
          acc[association.productId] = [];
      }
      acc[association.productId].push(association.userId);
      return acc;
  }, {});

    // Find the user with the least number of tasks assigned
    const userTaskCounts = await Promise.all(users.map(async (user: UserInstance) => {
      const taskCount = await Task.count({
          where: { assignedTo: user.id }
      });
      return { user, taskCount };
  }));

    userTaskCounts.sort((a, b) => a.taskCount - b.taskCount);

    for (const task of tasks) {
        const eligibleUsers = userTaskCounts.filter(utc => productUsersMap[task.productId].includes(utc.user.id));

        for (const userTaskCount of eligibleUsers) {
            const { user, taskCount } = userTaskCount;

            if (taskCount === 0) {
                await task.update({ assignedTo: user.id, status: 'In Progress' });
                userTaskCount.taskCount++;
                break;
            }
        }

        // If all users are working on an equal amount of tasks, assign using round-robin
        if (eligibleUsers.every(utc => utc.taskCount > 0)) {
            const userToAssign = eligibleUsers.shift();
            await task.update({ assignedTo: userToAssign.user.id, status: 'In Progress' });
            userToAssign.taskCount++;
            eligibleUsers.push(userToAssign);
        }
    }
  }

  async getTasks(options: GetTasksQuery):  Promise<{ tasks: TaskInstance[], count: number }>{
    const { assignedTo, precedence, status, deadline, productId, id, page = 1, pageSize = 10, includeProducts, includeCreator, includeLogs, includeAssigneeDetails} = options;
    const whereConditions: any = {};
  
    if (assignedTo) {
      whereConditions.assignedTo = assignedTo;
    }
    if (precedence) {
      whereConditions.precedence = precedence;
    }
    if (status) {
      whereConditions.status = status;
    }
    if (deadline) {
      whereConditions.deadline = {
        [Op.lte]: deadline,
      };
    }
    if (productId) {
      whereConditions.productId = productId;
    }
    if (id) {
      whereConditions.id = id;
    }

    const includeOptions: any[] = [];
    if (includeProducts) {
      includeOptions.push({
        model: db.Product,
        as: 'product',
      });
    }
    if (includeCreator) {
      includeOptions.push({
        model: db.User,
        as: 'creator',
      });
    }
    if (includeLogs) {
      includeOptions.push({
        model: db.TaskLog,
        as: 'logs',
        order: [['changedAt', 'DESC']]
      });
    }
    if (includeAssigneeDetails) {
      includeOptions.push({
        model: db.User,
        as: 'assignee',
      });
    }
    const offset = (page - 1) * pageSize;
    const { rows: tasks, count } = await Task.findAndCountAll({
      where: whereConditions,
      include: includeOptions,
      offset,
      limit: pageSize,
    });

    return {tasks, count};
  };


  async updateTaskStatus(taskId: number, status: string) {
    const task = await this.getTaskById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    task.status = status;
    await task.save();
    return task;
  }


  
  async getTaskSummary(): Promise<{users: UserTaskSummary[], totalUsers: number, totalTasks: number, backlogTasks: number}> {
    const users = await db.User.findAll({
      include: [
        {
          model: Task,
          as: 'assignedTasks',
          attributes: ['status'],
        },
      ],
    });
  
    const taskSummary: UserTaskSummary[] = users.map((user: UserAttributes) => {
      const tasks = user.assignedTasks as TaskAttributes[];
      const taskCounts: { [key: string]: number } = {
        total: tasks.length,
      };
  
      // Add other statuses if their count is greater than zero
      const inProgressCount = tasks.filter((task: TaskAttributes) => task.status === 'In Progress').length;
      if (inProgressCount > 0) {
        taskCounts.inProgress = inProgressCount;
      }
  
      const inQACount = tasks.filter((task: TaskAttributes) => task.status === 'In QA').length;
      if (inQACount > 0) {
        taskCounts.inQA = inQACount;
      }
  
      const doneCount = tasks.filter((task: TaskAttributes) => task.status === 'Done').length;
      if (doneCount > 0) {
        taskCounts.done = doneCount;
      }
  
      return {
        userId: user.id,
        username: user.firstName,
        taskCounts,
      };
    });
  
    const totalUsers = await db.User.count();
    const totalTasks = await Task.count();
    const backlogTasks = await Task.count({ where: { status: 'backlog' } });
  
    return {
      totalUsers,
      totalTasks,
      backlogTasks,
      users: taskSummary,
    };
  }
  
}
