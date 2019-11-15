module.exports = {
  up: queryInterface => {
    return queryInterface.dropTable('help_orders');
  },

  down: (queryInterface, Sequelize) => {},
};
