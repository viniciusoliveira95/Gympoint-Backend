module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('checkins', 'checkin_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColum('checkins', 'checkin_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
