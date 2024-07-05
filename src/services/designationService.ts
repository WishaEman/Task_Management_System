const db = require("@models/index");
const Designation = db.Designation;

type DesignationInstance = InstanceType<typeof Designation>;

export class DesignationService {
  
  async createDesignation(data: Partial<DesignationInstance>): Promise<DesignationInstance> {
    return Designation.create(data);
  }

  async getAllDesignations(): Promise<DesignationInstance[]>{
    return Designation.findAll();
  }

  async getDesignationById(id: number) : Promise<DesignationInstance>{
    const designation = await Designation.findByPk(id);
    if (!designation) throw new Error('Designation not found');
    return designation;
  }

  async updateDesignation(id: number, data: Partial<typeof Designation>) : Promise<DesignationInstance>{
    const designation = await Designation.findByPk(id);
    if (!designation) throw new Error('Designation not found');
    return designation.update(data);
  }
}
