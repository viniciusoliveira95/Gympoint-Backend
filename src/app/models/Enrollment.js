import Sequelize, { Model } from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';
import { isAfter } from 'date-fns';

class Enrollment extends Model {
  static init(sequelize) {
    super.init(
      {
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        price: Sequelize.NUMERIC,
        active: {
          type: Sequelize.VIRTUAL,
          get() {
            return (
              isAfter(this.end_date, new Date()) &&
              isAfter(new Date(), this.start_date)
            );
          },
        },
      },
      {
        sequelize,
      }
    );

    sequelizePaginate.paginate(Enrollment);

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
    this.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
  }
}

export default Enrollment;
