import * as Yup from 'yup';

import Student from '../models/Student';

class StudentSessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .integer()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou' });
    }

    const { id } = req.body;

    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(401).json({ error: 'Usuário não existe' });
    }

    return res.json(id);
  }
}

export default new StudentSessionController();
