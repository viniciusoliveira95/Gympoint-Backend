import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const { emailData } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${emailData.studentName} <${emailData.studentEmail}>`,
      subject: 'Confirmação de matrícula',
      template: 'welcome',
      context: {
        studentName: emailData.studentName,
        planName: emailData.planName,
        startDate: format(
          parseISO(emailData.start_date),
          "'dia' dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        endDate: format(
          parseISO(emailData.end_date),
          "'dia' dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        totalPrice: emailData.totalPrice,
        monthPrice: emailData.monthPrice,
      },
    });
  }
}

export default new WelcomeMail();
