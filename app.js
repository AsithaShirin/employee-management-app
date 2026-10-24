
 // Task1: initiate app and run server at 3000

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const path = require('path');
app.use(express.static(path.join(__dirname + '/dist/FrontEnd')));


// Task2: create mongoDB connection

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing from .env');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully!');
    })
    .catch((error) => {
        console.error('MongoDB Connection Failed:', error.message);
    });


// Employee Schema and Model

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    }
});

const Employee = mongoose.model('Employee', employeeSchema);


// Task 2 : write api with error handling and appropriate api mentioned in the TODO below


// TODO: get data from db using api '/api/employeelist'

app.get('/api/employeelist', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json(employees);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching employees',
            error: error.message
        });
    }
});


// TODO: get single data from db using api '/api/employeelist/:id'

app.get('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid employee ID'
            });
        }

        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json(employee);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching employee',
            error: error.message
        });
    }
});


// TODO: send data to db using api '/api/employeelist'
// Request body format:
// {name:'',location:'',position:'',salary:''}

app.post('/api/employeelist', async (req, res) => {
    try {
        const { name, location, position, salary } = req.body;

        const employee = new Employee({
            name,
            location,
            position,
            salary
        });

        const savedEmployee = await employee.save();

        res.status(201).json(savedEmployee);
    } catch (error) {
        res.status(400).json({
            message: 'Error adding employee',
            error: error.message
        });
    }
});


// TODO: delete a employee data from db
// using api '/api/employeelist/:id'

app.delete('/api/employeelist/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid employee ID'
            });
        }

        const deletedEmployee = await Employee.findByIdAndDelete(
            req.params.id
        );

        if (!deletedEmployee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json({
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting employee',
            error: error.message
        });
    }
});


// TODO: Update a employee data from db
// using api '/api/employeelist'
// Request body format:
// {name:'',location:'',position:'',salary:''}

app.put('/api/employeelist', async (req, res) => {
    try {
        const { _id, id, name, location, position, salary } = req.body;

        const employeeId = _id || id;

        if (!employeeId || !mongoose.isValidObjectId(employeeId)) {
            return res.status(400).json({
                message: 'Valid employee ID is required'
            });
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { name, location, position, salary },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEmployee) {
            return res.status(404).json({
                message: 'Employee not found'
            });
        }

        res.status(200).json(updatedEmployee);
    } catch (error) {
        res.status(400).json({
            message: 'Error updating employee',
            error: error.message
        });
    }
});


// ! dont delete this code. it connects the front end file.
// Connect the frontend
app.get('/{*splat}', function (req, res) {
    res.sendFile(path.join(__dirname, 'dist', 'FrontEnd', 'index.html'));
});

// Start server

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
