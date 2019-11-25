import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class StudentHelpOrderController {
  async store(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou' });
    }
    /**
     * Check if student exists
     */
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Aluno não existe' });
    }

    const { student_id, question } = await HelpOrder.create({
      student_id: studentId,
      question: req.body.question,
    });

    return res.json({
      student_id,
      question,
    });
  }

  async index(req, res) {
    const pageSize = 5;

    const { studentId } = req.params;
    const { page } = req.query;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Aluno não existe' });
    }

    const options = {
      order: [['createdAt', 'DESC']],
      page: page || null,
      paginate: page ? pageSize : null,
      where: {
        student_id: studentId,
      },
    };

    const { docs, pages } = await HelpOrder.paginate(options);

    const helpOrders = {
      helpOrderList: docs,
      nextPage: !(page >= pages),
      prevPage: !(page <= 1),
    };

    return res.json(helpOrders);
  }
}

export default new StudentHelpOrderController();
