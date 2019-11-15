import Sequelize, { Model } from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';

class Student extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        idade: Sequelize.INTEGER,
        peso: Sequelize.INTEGER,
        altura: Sequelize.INTEGER,
        activeEnrollment: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      }
    );

    sequelizePaginate.paginate(Student);

    return this;
  }

  static associate(models) {
    this.hasOne(models.Enrollment, {
      foreignKey: 'student_id',
      as: 'enrollment',
    });
  }
}

export default Student;
