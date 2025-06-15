CREATE TABLE store (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    zip_code VARCHAR(10) NOT NULL
);


CREATE TABLE bicycle (
    id SERIAL PRIMARY KEY,
    price DECIMAL(10, 2) NOT NULL,
    store_id INT,
    model VARCHAR(100) NOT NULL,
    FOREIGN KEY (store_id) REFERENCES store(id)
);


CREATE TABLE employee (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    store_id INT NOT NULL,
    supervisor_id INT,
    FOREIGN KEY (store_id) REFERENCES store(id),
    FOREIGN KEY (supervisor_id) REFERENCES employee(id)
);


CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE rental (
    id SERIAL PRIMARY KEY,
    bicycle_id INT NOT NULL,
    customer_id INT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (bicycle_id) REFERENCES bicycle(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);


CREATE TABLE salesperson (
    employee_id INT,
    commission_rate DECIMAL(5, 2) NOT NULL,
    revenue DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);


CREATE TABLE technician (
    employee_id INT,
    specialization VARCHAR(100) NOT NULL,
    certificate VARCHAR(100) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employee(id)
);

CREATE TABLE config (
    db VARCHAR(20) NOT NULL,
    data_imported BOOLEAN NOT NULL
);
INSERT INTO config (db, data_imported) VALUES ('pg', FALSE);