const { executeQuery } = require('../src/config/database');
const { hashPassword, formatDateForDB, formatDateTimeForDB } = require('../src/utils/helpers');

const seedData = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Create sample users
        const users = [
            {
                employee_id: 'ADMIN001',
                email: 'admin@company.com',
                password: 'Admin123!',
                first_name: 'System',
                last_name: 'Administrator',
                role: 'admin',
                department: 'IT',
                position: 'System Admin',
                phone: '+1234567890',
                hire_date: '2024-01-01'
            },
            {
                employee_id: 'HR001',
                email: 'hr@company.com',
                password: 'Hr123!',
                first_name: 'Sarah',
                last_name: 'Johnson',
                role: 'hr',
                department: 'Human Resources',
                position: 'HR Manager',
                phone: '+1234567891',
                hire_date: '2024-01-01'
            },
            {
                employee_id: 'MGR001',
                email: 'manager@company.com',
                password: 'Manager123!',
                first_name: 'John',
                last_name: 'Smith',
                role: 'manager',
                department: 'Engineering',
                position: 'Engineering Manager',
                phone: '+1234567892',
                hire_date: '2024-01-01'
            },
            {
                employee_id: 'EMP001',
                email: 'employee1@company.com',
                password: 'Employee123!',
                first_name: 'Alice',
                last_name: 'Brown',
                role: 'employee',
                department: 'Engineering',
                position: 'Software Developer',
                phone: '+1234567893',
                hire_date: '2024-01-15'
            },
            {
                employee_id: 'EMP002',
                email: 'employee2@company.com',
                password: 'Employee123!',
                first_name: 'Bob',
                last_name: 'Wilson',
                role: 'employee',
                department: 'Engineering',
                position: 'Senior Developer',
                phone: '+1234567894',
                hire_date: '2024-01-15'
            },
            {
                employee_id: 'EMP003',
                email: 'employee3@company.com',
                password: 'Employee123!',
                first_name: 'Carol',
                last_name: 'Davis',
                role: 'employee',
                department: 'Marketing',
                position: 'Marketing Specialist',
                phone: '+1234567895',
                hire_date: '2024-02-01'
            },
            {
                employee_id: 'EMP004',
                email: 'employee4@company.com',
                password: 'Employee123!',
                first_name: 'David',
                last_name: 'Miller',
                role: 'employee',
                department: 'Sales',
                position: 'Sales Representative',
                phone: '+1234567896',
                hire_date: '2024-02-01'
            },
            {
                employee_id: 'EMP005',
                email: 'employee5@company.com',
                password: 'Employee123!',
                first_name: 'Emma',
                last_name: 'Garcia',
                role: 'employee',
                department: 'Finance',
                position: 'Financial Analyst',
                phone: '+1234567897',
                hire_date: '2024-02-15'
            }
        ];

        console.log('Creating users...');
        const userIds = [];
        
        for (const user of users) {
            const hashedPassword = await hashPassword(user.password);
            
            const insertQuery = `
                INSERT INTO users (
                    employee_id, email, password, first_name, last_name, 
                    role, department, position, phone, hire_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await executeQuery(insertQuery, [
                user.employee_id,
                user.email,
                hashedPassword,
                user.first_name,
                user.last_name,
                user.role,
                user.department,
                user.position,
                user.phone,
                user.hire_date
            ]);
            
            if (result.success) {
                userIds.push(result.data.insertId);
                console.log(`✓ Created user: ${user.first_name} ${user.last_name} (${user.role})`);
            }
        }

        // Create departments
        console.log('Creating departments...');
        const departments = [
            { name: 'IT', description: 'Information Technology', manager_id: userIds[0] },
            { name: 'Human Resources', description: 'HR Department', manager_id: userIds[1] },
            { name: 'Engineering', description: 'Software Engineering', manager_id: userIds[2] },
            { name: 'Marketing', description: 'Marketing and Communications', manager_id: null },
            { name: 'Sales', description: 'Sales Department', manager_id: null },
            { name: 'Finance', description: 'Finance and Accounting', manager_id: null }
        ];

        for (const dept of departments) {
            const insertQuery = `
                INSERT INTO departments (name, description, manager_id) 
                VALUES (?, ?, ?)
            `;
            
            const result = await executeQuery(insertQuery, [
                dept.name,
                dept.description,
                dept.manager_id
            ]);
            
            if (result.success) {
                console.log(`✓ Created department: ${dept.name}`);
            }
        }

        // Create sample attendance records for the last 30 days
        console.log('Creating sample attendance records...');
        const today = new Date();
        
        for (let i = 30; i >= 1; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;
            
            const dateStr = formatDateForDB(date);
            
            // Create attendance for most employees (simulate some absences)
            for (let j = 3; j < userIds.length; j++) { // Skip admin, hr, manager
                const userId = userIds[j];
                
                // 90% attendance rate
                if (Math.random() < 0.9) {
                    const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
                    const checkInMinute = Math.floor(Math.random() * 60);
                    const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
                    const checkOutMinute = Math.floor(Math.random() * 60);
                    
                    const checkInTime = new Date(date);
                    checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
                    
                    const checkOutTime = new Date(date);
                    checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
                    
                    // Calculate hours (simplified)
                    const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
                    const overtimeHours = Math.max(0, totalHours - 8);
                    
                    // Determine status
                    let status = 'present';
                    if (checkInHour > 9 || (checkInHour === 9 && checkInMinute > 15)) {
                        status = 'late';
                    }
                    
                    const insertQuery = `
                        INSERT INTO attendance_records (
                            user_id, date, check_in_time, check_out_time, 
                            total_hours, overtime_hours, status, location, ip_address
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    
                    await executeQuery(insertQuery, [
                        userId,
                        dateStr,
                        formatDateTimeForDB(checkInTime),
                        formatDateTimeForDB(checkOutTime),
                        Math.round(totalHours * 100) / 100,
                        Math.round(overtimeHours * 100) / 100,
                        status,
                        'Office - Main Building',
                        '192.168.1.100'
                    ]);
                } else {
                    // Create absent record
                    const insertQuery = `
                        INSERT INTO attendance_records (
                            user_id, date, status
                        ) VALUES (?, ?, ?)
                    `;
                    
                    await executeQuery(insertQuery, [
                        userId,
                        dateStr,
                        'absent'
                    ]);
                }
            }
        }
        
        console.log('✓ Created sample attendance records for the last 30 days');

        // Create some holidays
        console.log('Creating holidays...');
        const holidays = [
            { name: 'New Year\'s Day', date: '2024-01-01', type: 'national' },
            { name: 'Independence Day', date: '2024-07-04', type: 'national' },
            { name: 'Labor Day', date: '2024-09-02', type: 'national' },
            { name: 'Thanksgiving', date: '2024-11-28', type: 'national' },
            { name: 'Christmas Day', date: '2024-12-25', type: 'national' },
            { name: 'Company Foundation Day', date: '2024-03-15', type: 'company' },
            { name: 'Annual Party', date: '2024-12-20', type: 'company' }
        ];

        for (const holiday of holidays) {
            const insertQuery = `
                INSERT INTO holidays (name, date, type, description) 
                VALUES (?, ?, ?, ?)
            `;
            
            const result = await executeQuery(insertQuery, [
                holiday.name,
                holiday.date,
                holiday.type,
                `${holiday.name} - ${holiday.type} holiday`
            ]);
            
            if (result.success) {
                console.log(`✓ Created holiday: ${holiday.name}`);
            }
        }

        // Create work schedules for employees
        console.log('Creating work schedules...');
        for (let i = 3; i < userIds.length; i++) { // Skip admin, hr, manager
            const userId = userIds[i];
            
            const insertQuery = `
                INSERT INTO work_schedules (
                    user_id, schedule_name, 
                    monday_start, monday_end,
                    tuesday_start, tuesday_end,
                    wednesday_start, wednesday_end,
                    thursday_start, thursday_end,
                    friday_start, friday_end,
                    effective_from
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            await executeQuery(insertQuery, [
                userId,
                'Standard Work Schedule',
                '09:00:00', '18:00:00',
                '09:00:00', '18:00:00',
                '09:00:00', '18:00:00',
                '09:00:00', '18:00:00',
                '09:00:00', '18:00:00',
                '2024-01-01'
            ]);
        }
        
        console.log('✓ Created work schedules for employees');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Sample Login Credentials:');
        console.log('Admin:     admin@company.com / Admin123!');
        console.log('HR:        hr@company.com / Hr123!');
        console.log('Manager:   manager@company.com / Manager123!');
        console.log('Employee:  employee1@company.com / Employee123!');
        console.log('Employee:  employee2@company.com / Employee123!');
        console.log('Employee:  employee3@company.com / Employee123!');
        console.log('Employee:  employee4@company.com / Employee123!');
        console.log('Employee:  employee5@company.com / Employee123!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeding if this file is executed directly
if (require.main === module) {
    seedData().then(() => {
        console.log('\n✅ Seeding process completed. You can now start the server.');
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    });
}

module.exports = seedData;