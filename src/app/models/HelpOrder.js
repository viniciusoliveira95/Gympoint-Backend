import Sequelize, { Model } from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';

class HelpOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        question: Sequelize.TEXT,
        answer: Sequelize.TEXT,
        answer_at: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    sequelizePaginate.paginate(HelpOrder);

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
  }
}

export default HelpOrder;
