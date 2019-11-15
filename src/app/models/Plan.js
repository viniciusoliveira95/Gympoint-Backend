import Sequelize, { Model } from 'sequelize';
import sequelizePaginate from 'sequelize-paginate';

class Plan extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        duration: Sequelize.INTEGER,
        price: Sequelize.NUMERIC,
      },
      {
        sequelize,
      }
    );

    sequelizePaginate.paginate(Plan);

    return this;
  }
}

export default Plan;
