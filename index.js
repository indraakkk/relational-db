const express = require('express')
const app = express()
const bodyParser = require('body-parser')



const Sequelize = require('sequelize')
const sequelize = new Sequelize('employee_demo', 'indra', '1', {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 6,
        min: 0,
        idle: 10000
    }
});


// body parser for parsing data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

const employees = sequelize.define('employees', {
    'emp_no': {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    'birth_date': Sequelize.DATE,
    'first_name': Sequelize.STRING,
    'last_name': Sequelize.STRING,
    'gender': Sequelize.ENUM('M', 'F'),
    'hire_date': Sequelize.DATE
}, {
    freezeTableName: true
})

// route get home
app.get('/', (req, res) => {
    res.send('Welcome to my API')
})

// get all data
app.get('/api/employees', (req, res) => {
    employees.findAll().then(employees => {
        res.json(employees)
    })
})

// post validation initialize
const {
    check,
    validationResult
} = require('express-validator/check');

// post data
app.post('/api/employees', [
    check('birth_date').isLength({
        min: 7
    }),
    check('first_name').isLength({
        min: 3
    }),
    check('last_name').isLength({
        min: 4
    }),
    check('gender').isLength({
        min: 1
    }),
    check('hire_date').isLength({
        min: 7
    })
], (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        })
    }

    employees.create({
            emp_no: req.body.emp_no,
            birth_date: req.body.birth_date,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            gender: req.body.gender,
            hire_date: req.body.hire_date
        })
        .then(newEmployees => {
            res.json({
                "status": "success",
                "message": "employees added",
                "data": newEmployees
            })
        })
})

// edit data sort wth nik
app.put('/api/employees', (req, res) => {
    const update = {
        emp_no: req.body.emp_no,
        birth_date: req.body.birth_date,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        hire_date: req.body.hire_date
    }
    employees.update(update, {
            where: {
                emp_no: req.body.emp_no
            }
        })
        .then(affectedRow => {
            return employees.findOne({
                emp_no: req.body.emp_no
            }, {
                returning: true,
                where: {}
            })
        })
        .then(DataRes => {
            res.json({
                "status": "success",
                "message": "employees change",
                "data": DataRes
            })
        })
})

app.delete('/api/employees/:emp_no', (req, res) => {
    employees.destroy({
            where: {
                emp_no: req.params.emp_no
            }
        })
        .then(affectedRow => {
            if (affectedRow) {
                return {
                    "status": "success",
                    "message": "employees deleted",
                    "data": null
                }
            }
            return {
                "status": "error",
                "message": "failed",
                "data": null
            }
        })
        .then(deleteData => {
            res.json(deleteData)
        })
})

app.listen(3000, () => console.log('App listen port 3000'))