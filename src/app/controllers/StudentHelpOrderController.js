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
      return res.status(400).json({ error: 'Validation fails' });
    }
    /**
     * Check if student exists
     */
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
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
    /**
     * Check if student exists
     */
    const { studentId } = req.params;
    const { page = 1 } = req.query;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const helpOrder = await HelpOrder.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        student_id: studentId,
      },
    });

    return res.json(helpOrder);
  }
}

export default new StudentHelpOrderController();
