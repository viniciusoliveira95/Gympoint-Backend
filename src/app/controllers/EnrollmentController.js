import * as Yup from 'yup';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO, isBefore, addMonths } from 'date-fns';

import WelcomeMail from '../jobs/WelcomeMail';
import Queue from '../../lib/Queue';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async store(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { plan_id, student_id, start_date } = req.body;

    /**
     * Chek if student exists
     */
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    /**
     * Check if the student has enrollment
     */
    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (enrollmentExists) {
      return res.status(400).json({ error: 'Student is already enrolled' });
    }

    /**
     * chek if plan exists
     */
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    /**
     * Check for past dates
     */
    const dayStart = startOfDay(parseISO(start_date));

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /**
     * calculate end_date and total price
     */
    const end_date = endOfDay(addMonths(dayStart, plan.duration));

    const price = plan.price * plan.duration;

    const enrollment = await Enrollment.create({
      plan_id,
      student_id,
      start_date: dayStart,
      end_date,
      price,
    });

    /**
     * send welcome e-mail
     */
    const emailData = {
      planName: plan.title,
      studentName: student.name,
      studentEmail: student.email,
      start_date: dayStart,
      end_date,
      totalPrice: price,
      monthPrice: plan.price,
    };

    await Queue.add(WelcomeMail.key, { emailData });

    return res.json(enrollment);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const enrollments = await Enrollment.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      order: ['start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'price'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async update(req, res) {
    /**
     * Fields validation
     */
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      student_id: Yup.number().required(),
      start_date: Yup.date().required(),
      end_date: Yup.date().required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /**
     * Check if enrollment exists
     */
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    /**
     * Check if the student has another enrollment
     */
    const { plan_id, student_id, start_date, end_date, price } = req.body;

    const hasAnotherEnrollment = await Enrollment.findOne({
      where: { id: { [Op.not]: enrollmentId }, student_id },
    });

    if (hasAnotherEnrollment) {
      return res.status(400).json({ error: 'Student is already enrolled' });
    }

    /**
     * chek if plan exists
     */
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    /**
     * Check for past dates
     */
    const dayStart = startOfDay(parseISO(start_date));

    if (isBefore(dayStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /**
     * Check if start_date < end_date
     */

    const dayEnd = endOfDay(parseISO(end_date));

    if (isBefore(dayEnd, dayStart)) {
      return res
        .status(400)
        .json({ error: 'End date cannot be less than start date' });
    }

    enrollment.update({
      student_id,
      plan_id,
      start_date: dayStart,
      end_date: dayEnd,
      price,
    });

    return res.json({
      student_id,
      plan_id,
      start_date: dayStart,
      end_date: dayEnd,
      price,
    });
  }

  async delete(req, res) {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    enrollment.destroy();

    return res.json({ sucess: 'Deleted' });
  }
}

export default new EnrollmentController();
