import { Op } from 'sequelize';
import { subDays } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    /**
     * Check if student exists
     */
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    /**
     * check if the student has exceeded the number of checkins
     */
    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: { [Op.between]: [subDays(new Date(), 7), new Date()] },
      },
    });

    if (checkins.length >= 5) {
      return res.status(400).json({ error: 'Checkins exceeded limit' });
    }

    const checkin = await Checkin.create({ student_id: studentId });

    return res.json(checkin);
  }

  async index(req, res) {
    /**
     * Check if student exists
     */
    const { studentId } = req.params;
    const { page = 1 } = req.query;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const checkins = await Checkin.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        student_id: studentId,
      },
    });
    return res.json(checkins);
  }
}

export default new CheckinController();
