from flask import Flask, request, jsonify, render_template
import sqlite3
import os

app = Flask(__name__)
DB_PATH = 'school.db'

# Initialize the database
def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS STUDENT (
            RollNo TEXT PRIMARY KEY,
            FullName TEXT NOT NULL,
            Class TEXT NOT NULL,
            BirthDate TEXT NOT NULL,
            Address TEXT NOT NULL,
            EnrollmentDate TEXT NOT NULL
        )
        ''')
    print('Database initialized.')

# Endpoint to check if RollNo exists
@app.route('/check/<roll_no>', methods=['GET'])
def check_roll_no(roll_no):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM STUDENT WHERE RollNo = ?', (roll_no,))
        record = cursor.fetchone()
        if record:
            return jsonify({
                'exists': True,
                'fullName': record[1],
                'class': record[2],
                'birthDate': record[3],
                'address': record[4],
                'enrollmentDate': record[5]
            })
        return jsonify({'exists': False})

# Endpoint to handle form submission
@app.route('/submit', methods=['POST'])
def submit_form():
    data = request.form
    roll_no = data.get('rollNo')
    full_name = data.get('fullName')
    class_name = data.get('class')
    birth_date = data.get('birthDate')
    address = data.get('address')
    enrollment_date = data.get('enrollmentDate')

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM STUDENT WHERE RollNo = ?', (roll_no,))
        record = cursor.fetchone()

        if record:
            cursor.execute('''
                UPDATE STUDENT SET
                FullName = ?,
                Class = ?,
                BirthDate = ?,
                Address = ?,
                EnrollmentDate = ?
                WHERE RollNo = ?
            ''', (full_name, class_name, birth_date, address, enrollment_date, roll_no))
            message = 'Record updated successfully.'
        else:
            cursor.execute('''
                INSERT INTO STUDENT (RollNo, FullName, Class, BirthDate, Address, EnrollmentDate)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (roll_no, full_name, class_name, birth_date, address, enrollment_date))
            message = 'Record saved successfully.'

    return jsonify({'message': message})

if __name__ == '__main__':
    if not os.path.exists(DB_PATH):
        init_db()
    app.run(debug=True)


