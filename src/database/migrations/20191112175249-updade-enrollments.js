module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('enrollments', 'price', {
      type: Sequelize.NUMERIC(10, 2),
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('enrollments', 'price', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
