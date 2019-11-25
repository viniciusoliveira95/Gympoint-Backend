import Sequelize, { Model } from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';

class Checkin extends Model {
  static init(sequelize) {
    super.init(
      {
        checkin_count: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    sequelizePaginate.paginate(Checkin);

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id' });
  }
}

export default Checkin;
