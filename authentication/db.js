const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('caqu2','root','caquapp', {
  host: '34.101.128.69',
  dialect: 'mysql',
  port: '3306',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Koneksi ke database berhasil');
  })
  .catch((error) => {
    console.error('Koneksi database gagal:', error);
  });

module.exports = sequelize;