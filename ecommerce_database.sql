/* CREATING DATABASE*/

CREATE database ECOMMERCE;

USE ECOMMERCE;

/* CREATING TABLE */

CREATE table customers(
Id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
Name varchar(30),
Email varchar(50),
Address varchar(200)
);

CREATE table orders(
Id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
customer_id INT,
order_date date,
total_amount decimal(10,2),
FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE table products(
Id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
name varchar(50),
price decimal(10,2),
description varchar(200)
);

/* INSERTING DATA TO TABLES */

INSERT INTO customers (NAME, EMAIL, ADDRESS) values 
('Maithili', 'maithili@gmail.com', 'Puducherry'),
('Prem', 'Prem@gmail.com', 'Chennai'),
('Chitra', 'Chitra@gmail.com', 'Vilupuram'),
('Sakthi', 'Sakthi@gmail.com', 'Ariyur'),
('Banu', 'Banu@gmail.com', 'Chidambaram');
 
 INSERT INTO orders (customer_id, order_date, total_amount) values 
 (23, '2025-11-01', 5500.00),
 (24, '2025-12-11', 800.00),
 (25, '2025-04-09', 9050.00),
 (26, '2026-01-03', 15500.00),
 (27, '2025-01-01', 10000.00);
 
  INSERT INTO products (NAME, PRICE, description) values 
  ('chocolates', 95.00, 'Dairy milk'),
  ('Chips', 95.00, 'Lays'),
  ('Sweets', 95.00, 'Kaju Katli'),
 ('Cake', 95.00, 'Choco Turfle'),
 ('Juice', 95.00, 'Pepsi');
 
 /*VERIFY 
SELECT * FROM customers;
SELECT * FROM products;
SELECT * FROM orders;
*/

/*
UPDATE products SET price = 55.00 WHERE id = 2;
UPDATE products SET price = 100.00 WHERE id = 3;
UPDATE products SET price = 70.00 WHERE id = 4;
UPDATE products SET price = 79.00 WHERE id = 5;
UPDATE orders SET order_date = '2025-12-25' WHERE id = 3;
UPDATE orders SET order_date = '2026-01-01' WHERE id = 5;

UPDATE orders SET customer_id = 1 WHERE id = 1;
UPDATE orders SET customer_id = 2 WHERE id = 2;
UPDATE orders SET customer_id = 3 WHERE id = 3;
UPDATE orders SET customer_id = 4 WHERE id = 4;
UPDATE orders SET customer_id = 5 WHERE id = 5;
*/

/*Retrieve all customers who have placed an order in the last 30 days.*/

SELECT DISTINCT c.*
FROM customers c
JOIN orders o
ON c.id = o.customer_id
WHERE o.order_date >= CURDATE() - INTERVAL 30 DAY;

/*Get the total amount of all orders placed by each customer.*/

SELECT 
    c.id,
    c.name,
    SUM(o.total_amount) AS total_order_amount
FROM customers c
JOIN orders o
ON c.id = o.customer_id
GROUP BY c.id, c.name;

/*Update the price of Product C to 45.00.*/

UPDATE products SET price = 45.00 WHERE id = 3;

/*Add a new column discount to the products table. */

ALTER TABLE products
ADD discount DECIMAL(5,2);

/*Retrieve the top 3 products with the highest price. */

SELECT *
FROM products
ORDER BY price DESC
LIMIT 3;


/* Get the names of customers who have ordered Product A. */

SELECT DISTINCT c.name
FROM customers c
JOIN orders o ON c.id = o.customer_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE p.name = 'Chips';

/* oin the orders and customers tables to retrieve the customer's name and order date for each order */

SELECT c.name, o.order_date
FROM customers c
JOIN orders o ON c.id = o.customer_id;

/* Retrieve the orders with a total amount greater than 150.00.*/

SELECT *
FROM orders
WHERE total_amount > 150.00;

/* Normalize the database by creating a separate table for order items and updating the orders table to reference the order_items table. */

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO order_items (order_id, product_id, quantity) VALUES
(1, 1, 2),  
(1, 3, 1), 
(2, 2, 5); 


UPDATE orders o
JOIN (
    SELECT oi.order_id, SUM(p.price * oi.quantity) AS total
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY oi.order_id
) t ON o.id = t.order_id
SET o.total_amount = t.total;

/*Retrieve the average total of all orders.*/

SELECT AVG(total_amount) AS avg_order_total
FROM orders;



