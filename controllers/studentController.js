const Company = require('../models/companySchema');
const Student = require('../models/studentSchema');

// Render create student page
const createStudentPage = async (req, res) => {
  try {
    return res.render('add_student');
  } catch (error) {
    console.log(`Error in rendering create student page: ${error}`);
    return res.redirect('back');
  }
};

// Create student
const createStudent = async (req, res) => {
  const { name, email, batch, college, placement, contactNumber, dsa, fronted, backend } = req.body;
  try {
    const student = await Student.findOne({ email });

    if (student) {
      console.log('Email already exists');
      return res.redirect('back');
    }

    const newStudent = await Student.create({
      name,
      email,
      college,
      batch,
      placement,
      contactNumber,
      dsa,
      fronted,
      backend,
    });
    await newStudent.save();

    return res.redirect('/');
  } catch (error) {
    console.log(`Error in creating student: ${error}`);
    return res.redirect('back');
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await Student.findById(id);

    if (student && student.interviews.length > 0) {
      for (let item of student.interviews) {
        const company = await Company.findOne({ name: item.company });

        if (company) {
          const studentIndex = company.students.findIndex(std => std.student.toString() === id);

          if (studentIndex !== -1) {
            company.students.splice(studentIndex, 1);
            await company.save();
          }
        }
      }
    }

    await Student.findByIdAndDelete(id);
    res.redirect('back');
  } catch (error) {
    console.log('Error in deleting student');
    return res.redirect('back');
  }
};

// Export the functions
module.exports = {
  createStudentPage,
  createStudent,
  deleteStudent
};
