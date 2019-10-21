import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class AnswerHelpOrderMail {
  get key() {
    return 'AnswerHelpOrderMail';
  }

  async handle({ data }) {
    const { helpOrder } = data;
    console.log(helpOrder);

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: 'Resposta do pedido de ajuda',
      template: 'answerHelpOrder',
      context: {
        studentName: helpOrder.student.name,
        question: helpOrder.question,
        createdAt: format(
          parseISO(helpOrder.createdAt),
          "'dia' dd 'de' MMMM 'de' yyyy",
          {
            locale: pt,
          }
        ),
        answer: helpOrder.answer,
      },
    });
  }
}

export default new AnswerHelpOrderMail();
