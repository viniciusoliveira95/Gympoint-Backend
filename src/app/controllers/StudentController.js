import * as Yup from 'yup';
import { Op } from 'sequelize';

import Student from '../models/Student';

class StudentController {
  async index(req, res) {
    const { name, page = 1 } = req.query;

    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'idade', 'peso', 'altura'],
      order: ['name'],
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        name: { [Op.iLike]: `${name}%` },
      },
    });

    return res.json(students);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number()
        .integer()
        .positive()
        .required(),
      peso: Yup.number()
        .integer()
        .positive()
        .required(),
      altura: Yup.number()
        .integer()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email } = req.body;

    const emaiExists = await Student.findOne({ where: { email } });

    if (emaiExists) {
      return res.status(400).json({ error: 'This email is already in use' });
    }

    const { id, name, idade, peso, altura } = await Student.create(req.body);
    return res.json({
      id,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      idade: Yup.number()
        .integer()
        .positive(),
      peso: Yup.number()
        .integer()
        .positive(),
      altura: Yup.number()
        .integer()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id, email } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(401).json({ error: 'Student not found' });
    }

    if (email && email !== student.email) {
      const emaiExists = await Student.findOne({ where: { email } });

      if (emaiExists) {
        return res.status(400).json({ error: 'This email is already in use' });
      }
    }

    const { name, idade, peso, altura } = await student.update(req.body);

    return res.json({
      id,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }
}

export default new StudentController();
