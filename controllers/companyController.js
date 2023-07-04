const Student = require('../models/studentSchema');
const Company = require('../models/companySchema');

// Render company page
exports.companyPage = async (req, res) => {
  try {
    const students = await Student.find({});
    return res.render('company', { students });
  } catch (error) {
    console.log(`Error in rendering page: ${error}`);
    return res.redirect('back');
  }
};

// Allocate interview
exports.allocateInterview = async (req, res) => {
  try {
    const students = await Student.find({});
    const uniqueBatches = [...new Set(students.map(student => student.batch))];
    return res.render('allocateInterview', { students, array: uniqueBatches });
  } catch (error) {
    console.log(`Error in allocating interview: ${error}`);
    return res.redirect('back');
  }
};

// Schedule interview
exports.scheduleInterview = async (req, res) => {
  const { id, company, date } = req.body;
  try {
    const existingCompany = await Company.findOne({ name: company });

    if (!existingCompany) {
      const newCompany = await Company.create({ name: company });
      newCompany.students.push({ student: id, date, result: 'Pending' });
      await newCompany.save();
    } else {
      const isStudentScheduled = existingCompany.students.some(student => student.student.toString() === id);
      if (isStudentScheduled) {
        console.log('Interview with this student already scheduled');
        return res.redirect('back');
      }
      existingCompany.students.push({ student: id, date, result: 'Pending' });
      await existingCompany.save();
    }

    const student = await Student.findById(id);

    if (student) {
      student.interviews.push({ company, date, result: 'Pending' });
      await student.save();
    }

    console.log('Interview Scheduled Successfully');
    return res.redirect('/company/home');
  } catch (error) {
    console.log(`Error in scheduling interview: ${error}`);
    return res.redirect('back');
  }
};

// Update status of interview
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { companyName, companyResult } = req.body;
  try {
    const student = await Student.findById(id);

    if (!student || student.interviews.length === 0) {
      console.log(`Student with ID ${id} not found or has no interviews`);
      return res.redirect('back');
    }

    const companyInterview = student.interviews.find(interview => interview.company === companyName);

    if (!companyInterview) {
      console.log(`Interview with ${companyName} not found for the student`);
      return res.redirect('back');
    }

    companyInterview.result = companyResult;
    await student.save();

    const company = await Company.findOne({ name: companyName });

    if (company) {
      const studentIndex = company.students.findIndex(std => std.student.toString() === id);
      if (studentIndex !== -1) {
        company.students[studentIndex].result = companyResult;
        await company.save();
      }
    }

    console.log('Interview Status Changed Successfully');
    return res.redirect('back');
  } catch (error) {
    console.log(`Error in updating status: ${error}`);
    return res.redirect('back');
  }
};

