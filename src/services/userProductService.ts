const db = require('@models/index');
const UserProduct = db.UserProduct;
const User = db.User;
const Product = db.Product;

type UserProductInstance  = InstanceType<typeof UserProduct>;
type ProductInstance = InstanceType<typeof Product>;


export class UserProductService {
  async createUserProduct(userId: number, productId: number): Promise<UserProductInstance > {
    try {
      const user = await UserProduct.create({userId, productId });
      return user;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('User already Enrolled in this product!');
      }
      throw error;
    }
  }

  async getUserProducts(userId: number): Promise<ProductInstance >{
    const user = await User.findOne({
      where: { id: userId },
      include: [{
        model: Product,
        as: 'products',
        through: { attributes: [] } // exclude the UserProduct association details
    }]
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.products;
  }

  async deleteUserProduct(userId: number, productId: number): Promise<void> {
    const userProduct = await UserProduct.findOne({
      where: { userId, productId }
    });

    if (!userProduct) throw new Error('UserProduct association not found');

    await userProduct.destroy();
  }
}

