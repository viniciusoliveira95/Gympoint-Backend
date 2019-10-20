import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .moreThan(0)
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * check if plan name is already in use
     */

    const planNameExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planNameExists) {
      return res.status(400).json({ error: 'Plan name is already in use' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async index(req, res) {
    const plan = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['price'],
    });

    return res.json(plan);
  }

  async update(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .moreThan(0),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * check if plan exists
     */
    const { planId } = req.params;

    const plan = await Plan.findByPk(planId);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    /**
     * check if plan name is already in use
     */
    const { title } = req.body;

    if (title !== plan.title) {
      const planNameExists = await Plan.findOne({
        where: { title },
      });

      if (planNameExists) {
        return res.status(400).json({ error: 'Plan name is already in use' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const { planId } = req.params;

    const plan = await Plan.findByPk(planId);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    plan.destroy();

    return res.json({ sucess: 'Deleted' });
  }
}

export default new PlanController();
