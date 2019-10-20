import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const {
      planName,
      studentName,
      studentEmail,
      start_date,
      end_date,
      totalPrice,
      monthPrice,
    } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${studentName} <${studentEmail}>`,
      subject: 'Confirmação de matrícula',
      template: 'welcome',
      context: {
        studentName,
        planName,
        startDate: format(
          parseISO(start_date),
          "'dia' dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        endDate: format(parseISO(end_date), "'dia' dd 'de' MMMM 'de' yyyy", {
          locale: pt,
        }),
        totalPrice,
        monthPrice,
      },
    });
  }
}

export default new WelcomeMail();
