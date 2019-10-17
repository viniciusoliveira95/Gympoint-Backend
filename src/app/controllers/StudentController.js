class StudentController {
  async store(req, res) {
    return res.json({ res: ' Student Controller ' });
  }
}

export default new StudentController();
