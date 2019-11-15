import * as Yup from 'yup';
import { Op } from 'sequelize';
import { parseISO, isBefore, addMonths } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

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
      return res.status(400).json({ error: 'Validação falhou' });
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
    const dayStart = zonedTimeToUtc(parseISO(start_date), 'America/Sao_Paulo');

    if (isBefore(dayStart, Date.UTC(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /**
     * calculate end_date and total price
     */
    const end_date = addMonths(dayStart, plan.duration);

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
    const pageSize = 20;

    const { page } = req.query;

    const options = {
      attributes: ['id', 'start_date', 'end_date', 'active'],
      page: page || null,
      paginate: page ? pageSize : null,
      order: [[{ model: Student, as: 'student' }, 'name', 'asc']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'id'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'duration', 'title', 'price'],
        },
      ],
      // order: [{ model: Student, as: 'student' }, 'updated_at', 'asc'],
    };

    const { docs, pages } = await Enrollment.paginate(options);

    docs.map(enrollment => {
      enrollment.start_date = utcToZonedTime(
        enrollment.start_date,
        'America/Sao_Paulo'
      );

      enrollment.end_date = utcToZonedTime(
        enrollment.end_date,
        'America/Sao_Paulo'
      );

      return enrollment;
    });

    const enrollments = {
      enrollmentList: docs,
      nextPage: !(page >= pages),
      prevPage: !(page <= 1),
    };

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
    const { plan_id, student_id, start_date } = req.body;

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
    const dayStart = zonedTimeToUtc(parseISO(start_date), 'America/Sao_Paulo');

    if (isBefore(dayStart, Date.UTC(new Date()))) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /**
     * Check if start_date < end_date
     */

    const end_date = addMonths(dayStart, plan.duration);

    const price = plan.price * plan.duration;

    enrollment.update({
      student_id,
      plan_id,
      start_date: dayStart,
      end_date,
      price,
    });

    return res.json({
      student_id,
      plan_id,
      start_date: dayStart,
      end_date,
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

  async show(req, res) {
    const { enrollmentId } = req.params;

    const enrollment = await Enrollment.findByPk(enrollmentId, {
      attributes: ['id', 'start_date'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'duration', 'title', 'price'],
        },
      ],
    });

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not exist' });
    }

    enrollment.start_date = utcToZonedTime(
      enrollment.start_date,
      'America/Sao_Paulo'
    );

    return res.json(enrollment);
  }
}

export default new EnrollmentController();
