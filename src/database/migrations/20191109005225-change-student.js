module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('students', 'peso', {
        type: Sequelize.NUMERIC(5, 1),
        allowNull: false,
      }),
      queryInterface.changeColumn('students', 'altura', {
        type: Sequelize.NUMERIC(3, 2),
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn('students', 'peso', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.changeColumn('students', 'altura', {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ]);
  },
};
