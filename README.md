# Task_Management_System
## It is a Node.js & Sequelize TypeScript Project with JWT Authentication Storing Token in Reddis

## Objective:
Develop a comprehensive task management application designed for developer employees. The application will track and display the tasks developers are working on, including deployment details, branch names, task estimates, statuses, user engagement and more. The system will streamline task assignments, manage server ports, maintain a backlog, generate notifications, establish task precedence.

# Prerequisites:
Before you start, ensure you have the following installed:

* [Node.js] (v18.x or later recommended)
* [MySQL]
* [npm] or [Yarn]

# Installation
## 1. Clone the repository:
```
git clone [Repo Link](https://github.com/WishaEman/Task_Management_System.git)
cd your-repository
```

## 2. Install dependencies:
```
npm install
# or
yarn install
```

## 3. Create a .env file in the root directory and add your database configuration:
```
PORT=3000
DB_USER=root
DB_PASSWORD=password
DB_NAME=your_database_name
DB_HOST=localhost
DB_DIALECT=mysql
DB_PORT=3306
JWT_SECRET_KEY=your_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 4. Configuration

** Database Configuration: Update config/config.js with your database credentials or adjust the .env variables to match your database setup.
** TypeScript Configuration: Modify tsconfig.json if you need to change the TypeScript compilation settings.

## 5. Build & Run

## 1. Buid the Project
```bash
npm run build:services
# or
yarn build:services
```
This will compile TypeScript files from the src/services folder to JavaScript files in the build/services directory.

## 2. Run the project:

```bash
npm start/ npm run dev
# or
yarn start
```
This will start the application in production mode.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)


