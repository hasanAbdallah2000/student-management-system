import coursesRepository from "../repositories/courses.repository.js";
import enrollmentsRepository from "../repositories/enrollments.repository.js";
import usersRepository from "../repositories/users.repository.js";

class DashboardService {
 async getStats(user) {
  if (user.role === "admin") {
    return {
      users: await usersRepository.countAll(),
      courses: await coursesRepository.countAll(),
      enrollments: await enrollmentsRepository.countAll(),
    };
  }

  if (user.role === "teacher") {
    return {
      myCourses: await coursesRepository.countByTeacher(user.id),
      myEnrollments: await enrollmentsRepository.countByTeacher(user.id),
    };
  }

  if (user.role === "student") {
    return {
      myCourses: await enrollmentsRepository.countCoursesByStudent(user.id),
      myEnrollments: await enrollmentsRepository.countByStudent(user.id),
    };
  }

  return {};
}
}

export default new DashboardService();
