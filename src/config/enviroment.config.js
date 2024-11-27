import dotenv from 'dotenv';

//Va  aleer el archivo .env y guardara los valores en process.env
dotenv.config();

const ENVIROMENT = {
    BACKPORT: process.env.BACKPORT || 3000,
    FRONTPORT: process.env.FRONTPORT || 5173,
    DB_URL: process.env.DB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    GMAIL_USER: process.env.GMAIL_USER,
    API_KEY_INTERN: process.env.API_KEY_INTERN,
    MYSQL: {
        USERNAME: process.env.MYSQL_USERNAME,
        HOST: process.env.MYSQL_HOST,
        PASSWORD: process.env.MYSQL_PASSWORD,
        DATABASE: process.env.MYSQL_DATABASE,
    }
}

export default ENVIROMENT