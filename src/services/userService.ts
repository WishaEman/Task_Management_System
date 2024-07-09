const db = require("@models/index");
const User = db.User;
const UserProduct = db.UserProduct;
const Product = db.Product;

type UserInstance = InstanceType<typeof User>;

export class UserService {
  async createUser(data: Partial<UserInstance>): Promise<UserInstance> {
    try {
      const user = await User.create(data);
      return user;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email address already in use!');
      }
      throw error;
    }
  }

  async getAllUsers(): Promise<UserInstance[]> {
    return User.findAll({
      include: [{
        model: Product,
        as: 'products',
        through: { attributes: [] } // exclude the UserProduct association details
    }]
    });
  }

  async getUserById(id: number): Promise<UserInstance | null> {
    return User.findByPk(id, {
      include: ['designation', 'manager', 'subordinates', 'products'],
    });
  }

  async updateUser(id: number, data: Partial<UserInstance>): Promise<UserInstance | null> {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    return user.update(data);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await User.findByPk(id);
    if (!user) throw new Error('User not found');
    await user.destroy();
  }

  async getSubordinates(userId: number): Promise<UserInstance[] | string> {
    const subordinates = await User.findAll({
      where: { managerId: userId },
    });

    if (subordinates.length === 0) return 'This user is not a manager and has no subordinates.';

    return subordinates;
  }
  
  async getManager(userId: number): Promise<UserInstance | string> {
    const user = await User.findByPk(userId, {
      include: [{ model: User, as: 'manager'}]
    });

    if (!user) return 'User not found.';

    if (!user.manager) return 'This user is itself a manager.';

    return user.manager;
  }


  async findUserByEmail(email: string): Promise<UserInstance>{
    return await User.findOne({ where: { email } });
  };
}
