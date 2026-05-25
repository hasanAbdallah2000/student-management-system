// Import the users repository for database operations
import usersRepository from '../repositories/users.repository.js';
import bcrypt from 'bcryptjs';


class UsersService {
    /**
     * Get all users
     * @returns {Promise<Array>} - Array of all users
     */
    async getAllUsers() {
        // Call repository to get data from database
        // db.execute() returns [rows, fields], we only need rows
        const [users] = await usersRepository.findAll();
        return users;
    }

    async getTeachers() {
      const [rows] = await usersRepository.findTeachers();
      return rows;
    }

    async teacherHasCourses(userId) {
      const [rows] = await usersRepository.countTeacherCourses(userId);
      return rows[0].count > 0;
    }

    async getTeacherCourses(id){

      const userId = Number(id);
      if (!Number.isInteger(userId) || userId < 1){
        throw new Error("Id must be positive integer");
      }

      const user = await this.getUserById(userId);
      if (!user){
        throw new Error("Selected user is not a teacher");
      }

      const [allCourses] = await usersRepository.findAllCourses();
      const [assigned] = await usersRepository.findTeacherCourseIds(userId);

      return { 
        courses: allCourses,
        assignedCourseIds: assigned.map((row) => row.course_id),
      };
    }

    async assignTeacherCourses(id, courseIds = []){

      const userId = Number(id);
      if (!Number.isInteger(userId) || userId < 1){
        throw new Error("Id must be a positive integer");
      }

      const user = await this.getUserById(userId);
      if (!user){
        throw new Error (`User with id ${userId} is not found`);
      }

      if (user.role !== "teacher"){
        throw new Error("Selected user is not a teacher");
      }

      if (!Array.isArray(courseIds)){
        throw new Error("courseIds must be an array");
      }

      await usersRepository.deleteTeacherCourses(userId);

      for(const courseId of courseIds){
        await usersRepository.assignCourseToTeacher(userId, courseId);
      }
    }

    /**
     * Get a single user by ID
     * @param {number} id - The user ID
     * @returns {Promise<Object|null>} - User object or null if not found
     * @throws {Error} - If ID is invalid
     */
    async getUserById(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Retrieve user from database
        const [user] = await usersRepository.findById(id);
        
        // Return the first user or null if not found
        return user.length > 0 ? user[0] : null;
    }
    async updateUserById(id, { email, fullName, role, avatarUrl }) {
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId < 1) {
    throw new Error("Id must be a positive integer");
  }

  // لازم المستخدم يكون موجود
  const existing = await this.getUserById(userId);
  if (!existing) {
    throw new Error(`User with id ${userId} is not found`);
  }

  // role validation (إذا انبعتت)
  if (role !== undefined) {
    const allowedRoles = ["admin", "student", "teacher"];
    if (!allowedRoles.includes(role)) {
      throw new Error("Invalid role provided");
    }
  }

  // email duplicate check (إذا انبعتت + تغيّرت)
  if (email !== undefined && email !== existing.email) {
    const [found] = await usersRepository.findByEmail(email);
    if (found && found.length > 0) {
      throw new Error("A user with this email already exists");
    }
  }

  // جهّز fields بأسماء أعمدة DB
  const fieldsToUpdate = {
    email: email ?? undefined,
    full_name: fullName ?? undefined,
    role: role ?? undefined,
    avatar_url: avatarUrl ?? undefined,
  };

  const [result] = await usersRepository.updateUser(userId, fieldsToUpdate);

  // إذا ما في ولا field انبعت => ما بصير شي
  if (!result || result.affectedRows === 0) {
    // ما نرمي error هون… بس رجّع نفس المستخدم أو رجّع updated (حسب ذوقك)
    return existing;
  }

  // رجّع المستخدم بعد التعديل
  const updated = await this.getUserById(userId);
  return updated;
}

async getTeachers() {
  const [rows] = await usersRepository.findTeachers();

  return rows;
}

    /**
     * Delete a user
     * @param {number} id - The user ID to delete
     * @returns {Promise<number>} - Number of rows affected (0 or 1)
     * @throws {Error} - If ID is invalid
     */
    async deleteUser(id) {
        // Validation: ID must be a positive integer
        if (id < 1) {
            throw new Error('Id must be a positive integer');
        }
        
        // Delete user from database
        const [result] = await usersRepository.deleteUser(id);
        
        // Return number of rows affected (0 if not found, 1 if deleted)
        return result.affectedRows;
    }
        

    /**
     * Create a new user (admin or student).
     * @param {Object} userData
     * @param {string} userData.email
     * @param {string} userData.password
     * @param {string} userData.fullName
     * @param {'admin'|'student'|'instructor'} userData.role
     * @param {string|null} userData.avatarUrl
     * @returns {Promise<number>} - New user's id
     * @throws {Error} - On invalid input
     */
    async createUser({ email, password, fullName, role, avatarUrl = null }) {
        if (!email || !password || !fullName || !role) {
            throw new Error('Email, password, full name, and role are required');
        }

        const allowedRoles = ['admin', 'student', 'teacher'];
        if (!allowedRoles.includes(role)) {
            throw new Error('Invalid role provided');
        }

        // Hash the password before storing it
        const passwordHash = await bcrypt.hash(password, 10);

        try {
            const [result] = await usersRepository.createUser({
                email,
                passwordHash,
                fullName,
                role,
                avatarUrl
            });

            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A user with this email already exists');
            }
            throw error;
        }
    }
}

// Export a singleton instance of the UsersService class
export default new UsersService();
