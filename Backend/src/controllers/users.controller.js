import usersService from '../services/users.service.js';
import ApiError from '../util/ApiError.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';


class UsersController {
    
    getAllUsers = asyncHandler(async (req, res) => {
    const users = await usersService.getAllUsers();

         return res.status(200).json({
            success: true,
            data: users || [],
            count: (users || []).length,
             });
        });

         getTeachers = asyncHandler(async (req, res) => {
        const teachers = await usersService.getTeachers();

        return res.status(200).json({
            success: true,
            data: teachers || [],
            count: (teachers || []).length,
        });
        });

        getTeachersCourses = asyncHandler(async (req, res) => {
            const { id } = req.params;
            const data = await usersService.getTeacherCourses(id);

            return res.status(200).json({
                success: true,
                data,
            });
        });
        
        assignTeacherCourses =asyncHandler(async (req, res) => {
            const { id } = req.params;
            const {courseIds} = req.body;

            await usersService.assignTeacherCourses(id, courseIds || []);

            return res.status(200).json({
                success : true,
                message : "Teacher courses update successfully",
            });
        });

        updateUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const { email, fullName, role, avatarUrl } = req.body;

        const updatedUser = await usersService.updateUserById(id, {
            email,
            fullName,
            role,
            avatarUrl,
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
        });

    async getUserById(req, res) {
        try {
            const { id } = req.params;
            
            const user = await usersService.getUserById(id);

            if (!user) {
                return res.status(404).json({
                    error: `User with id ${id} is not found`
                });
            }

            return res.status(200).json({ user });
        } catch (error) {
            console.error(error);
            
            if (error.message === 'Id must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }
            
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }


    async destroyUserById(req, res) {
        try {
            const { id } = req.params;
            
     
            const hasCourses = await usersService.teacherHasCourses(id);

            if (hasCourses) {
            return res.status(409).json({
                error: "Cannot delete teacher because they are assigned to courses"
            });
            }

            const affectedRows = await usersService.deleteUser(id);

            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `User with id ${id} is not found`
                });
            }

            return res.status(200).json({
                message: `User with id ${id} was successfully deleted`
            });
        } catch (error) {
            console.error(error);
            
            if (error.message === 'Id must be a positive integer') {
                return res.status(400).json({ error: error.message });
            }
            
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }
        updateUserById = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const { fullName, email, role, avatarUrl } = req.body;

        const updated = await usersService.updateUserById(id, {
            fullName,
            email,
            role,
            avatarUrl,
        });

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updated,
        });
        });


    async createUser(req, res) {
        try {
            const { email, password, fullName, full_name, role, avatarUrl } = req.body;

            const newUserId = await usersService.createUser({
                email,
                password,
                fullName : fullName || full_name,
                role,
                avatarUrl
            });

            return res.status(201).json({
                message: 'User created successfully',
                userId: newUserId
            });
        } catch (error) {
            console.error(error);

            if (error.message === 'Email, password, full name, and role are required') {
                return res.status(400).json({ error: error.message });
            }

            if (error.message === 'Invalid role provided') {
                return res.status(400).json({ error: error.message });
            }

            if (error.message === 'A user with this email already exists') {
                return res.status(409).json({ error: error.message });
            }

            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }
}

export default new UsersController();
