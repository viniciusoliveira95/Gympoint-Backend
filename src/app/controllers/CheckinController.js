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
      return res.status(400).json({ error: 'Aluno não existe' });
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
      return res.status(400).json({ error: 'Limite de checkins foi atingido' });
    }

    const latestCheckinCount = await Checkin.max('checkin_count', {
      where: { student_id: studentId },
    });

    const checkin_count = latestCheckinCount ? latestCheckinCount + 1 : 1;

    const checkin = await Checkin.create({
      student_id: studentId,
      checkin_count,
    });

    return res.json(checkin);
  }

  async index(req, res) {
    const pageSize = 20;

    const { studentId } = req.params;
    const { page } = req.query;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Aluno não existe' });
    }

    const options = {
      page: page || null,
      paginate: page ? pageSize : null,
      where: {
        student_id: studentId,
      },
      order: [['checkin_count', 'DESC']],
    };

    const { docs, pages } = await Checkin.paginate(options);

    const checkins = {
      checkinList: docs,
      nextPage: !(page >= pages),
      prevPage: !(page <= 1),
    };

    return res.json(checkins);
  }
}

export default new CheckinController();
