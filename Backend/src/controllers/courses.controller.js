import coursesService from '../services/courses.service.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import ApiError from '../util/ApiError.js';

class CoursesController {
    
    async getAllCourses(req, res) {
        try {
            // Call service to get all courses
            const courses = await coursesService.getAllCourses();
            
            // Check if any courses were found
            if (courses.length < 1) {
                return res.status(404).json({
                    error: 'No courses found in the database.'
                });
            }
            
            return res.status(200).json({ courses });
        } catch (error) {
            console.error(error);
            
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    
    async getCourseById(req, res) {
        try {
            const { id } = req.params;
            
            const course = await coursesService.getCourseById(id);

            if (!course) {
                return res.status(404).json({
                    error: `Course with id ${id} is not found`
                });
            }

            return res.status(200).json({ course });
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

   
    async createCourse(req, res) {
        try {
            const { code, name, credits } = req.body;
            
            const courseId = await coursesService.createCourse(code, name, credits);

            return res.status(201).json({
                message: 'Course created successfully',
                courseId
            });
        } catch (error) {
            console.error(error);
            
            if (error.message === 'Code and name are required') {
                return res.status(400).json({ error: error.message });
            }
            
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }


    async updateCourseById(req, res) {
        try {
            const { id } = req.params;
            
            const { code, name, credits } = req.body;
            
            const affectedRows = await coursesService.updateCourse(id, code, name, credits);

            if (affectedRows === 0) {
                return res.status(404).json({
                    error: `Course with id ${id} is not found`
                });
            }

            return res.status(200).json({
                message: `Course with id ${id} updated successfully`
            });
        } catch (error) {
            console.error(error);
            
            if (error.message === 'Code and name are required') {
                return res.status(400).json({ error: error.message });
            }
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'This course code already exists'
                });
            }
            
            return res.status(500).json({
                error: 'Server Error, please try again.'
            });
        }
    }

    
    destroyCourseById = asyncHandler(async(req, res) => {
            const { id } = req.params;
            
            const affectedRows = await coursesService.deleteCourse(id);

            if (!affectedRows){ throw new ApiError(404, `Course with id ${id} is not found`, "COURSE_NOT_FOUND");
}
           return res.status(200).json({ success: "true" , message: "course deleted",});

            });
    
}

export default new CoursesController();
