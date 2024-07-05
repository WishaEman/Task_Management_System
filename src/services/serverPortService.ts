const db = require('@models/index');
const ServerPort = db.ServerPort;

type ServerPortInstance = InstanceType<typeof ServerPort>;

export class ServerPortService {
    async createServerPort(portNumber: number): Promise<ServerPortInstance > {
      const serverPort = await ServerPort.create({ portNumber });
      return serverPort;
    }
  
    async getAllServerPorts(): Promise<ServerPortInstance[]> {
      return ServerPort.findAll();
    }
  
    async getServerPortStatus(portNumber: number): Promise<string> {
      const serverPort = await ServerPort.findOne({
        where: { portNumber },
      });
  
      if (!serverPort) throw new Error('Server port not found');
  
      return serverPort.status;
    }
}
