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
      return res.status(400).json({ error: 'Validação falhou' });
    }

    /**
     * check if plan name is already in use
     */

    const planNameExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planNameExists) {
      return res
        .status(400)
        .json({ error: 'Nome do plano já está sendo utilizado' });
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
    const pageSize = 20;

    const { page } = req.query;

    const options = {
      attributes: ['id', 'title', 'duration', 'price'],
      order: ['price'],
      page: page || null,
      paginate: page ? pageSize : null,
    };

    const { docs, pages } = await Plan.paginate(options);

    const plans = {
      planList: docs,
      nextPage: !(page >= pages),
      prevPage: !(page <= 1),
    };

    return res.json(plans);
  }

  async show(req, res) {
    const { planId } = req.params;

    const plan = await Plan.findByPk(planId);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não existe' });
    }

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
      return res.status(400).json({ error: 'Validação falhou' });
    }

    /**
     * check if plan exists
     */
    const { planId } = req.params;

    const plan = await Plan.findByPk(planId);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não existe' });
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
        return res
          .status(400)
          .json({ error: 'Nome do plano já está sendo utilizado' });
      }
    }

    const { id, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    const { planId } = req.params;

    const plan = await Plan.findByPk(planId);

    if (!plan) {
      return res.status(400).json({ error: 'Plano não existe' });
    }

    plan.destroy();

    return res.json({ sucess: 'Deletado' });
  }
}

export default new PlanController();
