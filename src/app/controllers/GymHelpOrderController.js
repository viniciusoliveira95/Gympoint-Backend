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
      return res.status(400).json({ error: 'Validação falhou' });
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
      return res.status(400).json({ error: 'Pedido de ajuda não existe' });
    }

    if (helpOrder.answer !== null) {
      return res
        .status(400)
        .json({ error: 'Pedido de ajuda já foi respondido' });
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
    const pageSize = 20;

    const { page } = req.query;

    const options = {
      attributes: ['id', 'question'],
      order: [['created_at', 'DESC']],
      page: page || null,
      paginate: page ? pageSize : null,
      where: { answer: null },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name'],
        },
      ],
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

export default new GymHelpOrderContoller();
