import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import StudentHelpOrderController from './app/controllers/StudentHelpOrderController';
import GymHelpOrderController from './app/controllers/GymHelpOrderController';
import StudentSessionController from './app/controllers/StudentSessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post('/students/sessions', StudentSessionController.store);

routes.post('/students/:studentId/checkins', CheckinController.store);
routes.get('/students/:studentId/checkins', CheckinController.index);

routes.post(
  '/students/:studentId/help-orders',
  StudentHelpOrderController.store
);
routes.get(
  '/students/:studentId/help-orders',
  StudentHelpOrderController.index
);

/**
 * The routes below need auth token
 */
routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.get('/students', StudentController.index);
routes.get('/students/:studentId', StudentController.show);
routes.put('/students/:studentId', StudentController.update);
routes.delete('/students/:studentId', StudentController.delete);

routes.post('/plans', PlanController.store);
routes.get('/plans', PlanController.index);
routes.get('/plans/:planId', PlanController.show);
routes.put('/plans/:planId', PlanController.update);
routes.delete('/plans/:planId', PlanController.delete);

routes.post('/enrollments', EnrollmentController.store);
routes.get('/enrollments', EnrollmentController.index);
routes.put('/enrollments/:enrollmentId', EnrollmentController.update);
routes.delete('/enrollments/:enrollmentId', EnrollmentController.delete);
routes.get('/enrollments/:enrollmentId', EnrollmentController.show);

routes.get('/help-orders', GymHelpOrderController.index);
routes.put('/help-orders/:HelpOrderId/answer', GymHelpOrderController.store);

export default routes;
