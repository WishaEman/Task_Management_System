const db = require('@models/index');
const Product = db.Product;

type ProductInstance = InstanceType<typeof Product>;

export class ProductService {
  async createProduct(data: Partial<ProductInstance>): Promise<ProductInstance> {
    return Product.create(data);
  }

  async getAllProducts(): Promise<ProductInstance[]> {
    return Product.findAll();
  }

  async getProductById(id: number): Promise<ProductInstance | null> {
    return Product.findByPk(id);
  }

  async updateProduct(id: number, data: Partial<ProductInstance>): Promise<[number, ProductInstance[]]> {
    return Product.update(data, {
      where: { id },
      returning: true,  // Get the updates rows count and also data
    });
  }

  async deleteProduct(id: number): Promise<void> {
    return Product.destroy({
      where: { id },
    });
  }
}
