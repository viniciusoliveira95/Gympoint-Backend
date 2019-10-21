import * as Yup from 'yup';

import AnswerHelpOrderMail from '../jobs/AnswerHelpOrderMail';
import Queue from '../../lib/Queue';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class GymHelpOrderContoller {
  async store(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * check if HelpOrder exists and is not answered
     */
    const { HelpOrderId } = req.params;

    const helpOrder = await HelpOrder.findByPk(HelpOrderId, {
      include: [
        { model: Student, as: 'student', attributes: ['name', 'email'] },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order does not exist' });
    }

    if (helpOrder.answer !== null) {
      return res.status(400).json({ error: 'Help order is already answered' });
    }

    helpOrder.answer = req.body.answer;
    helpOrder.answer_at = new Date();

    await helpOrder.save();

    /**
     * send answer e-mail
     */
    await Queue.add(AnswerHelpOrderMail.key, { helpOrder });

    return res.json(helpOrder);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrder = await HelpOrder.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: { answer: null },
    });

    return res.json(helpOrder);
  }
}

export default new GymHelpOrderContoller();
