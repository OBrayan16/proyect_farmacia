module.exports = {
  HOST: "ep-tiny-heart-ayzrpyi8-pooler.c-5.us-east-2.aws.neon.tech",
  USER: "neondb_owner",
  PASSWORD: process.env.DB_NAME || "neondb",
  DB: "neondb",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};