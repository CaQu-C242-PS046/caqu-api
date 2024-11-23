const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('CaQu','root','', {
  host: 'localhost',
  dialect: 'mysql',
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