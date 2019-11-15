import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isAfter } from 'date-fns';

import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

class StudentController {
  async index(req, res) {
    const pageSize = 20;

    const { name, page } = req.query;

    const options = {
      attributes: ['id', 'name', 'email', 'idade', 'activeEnrollment'],
      order: ['name'],
      page: page || null,
      paginate: page ? pageSize : null,
      where: {
        name: { [Op.iLike]: `${name}%` },
      },
      include: [
        {
          model: Enrollment,
          as: 'enrollment',
          attributes: ['start_date', 'end_date'],
        },
      ],
    };

    const { docs, pages } = await Student.paginate(options);

    docs.map(student => {
      if (student.enrollment) {
        student.activeEnrollment =
          isAfter(student.enrollment.end_date, new Date()) &&
          isAfter(new Date(), student.enrollment.start_date);
      } else {
        student.activeEnrollment = false;
      }

      return student;
    });

    const students = {
      studentList: docs,
      nextPage: !(page >= pages),
      prevPage: !(page <= 1),
    };

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
        .positive()
        .required(),
      altura: Yup.number()
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
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      idade: Yup.number()
        .integer()
        .positive()
        .required(),
      peso: Yup.number()
        .positive()
        .required(),
      altura: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { studentId } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(studentId);

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
      studentId,
      name,
      email,
      idade,
      peso,
      altura,
    });
  }

  async delete(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    student.destroy();

    return res.json({ sucess: 'Deleted' });
  }

  async show(req, res) {
    const { studentId } = req.params;

    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const { id, name, email, idade, peso, altura } = student;

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
