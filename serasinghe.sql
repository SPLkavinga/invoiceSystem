-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2026 at 08:25 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `serasinghe`
--

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `nic` varchar(50) NOT NULL,
  `tp_number` varchar(30) NOT NULL,
  `company_name` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `fax` varchar(30) DEFAULT NULL,
  `customer_type` enum('Individual','Business') DEFAULT 'Individual',
  `notes` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `user_id`, `customer_name`, `nic`, `tp_number`, `company_name`, `address`, `email`, `fax`, `customer_type`, `notes`, `image`, `created_at`) VALUES
(1, 1, 'Ravindu', '12574125', '0711122089', 'ravi', '147/1,sokmanwatta,Kotawila,kamburugamuwa', 'ravindu@gmail.com', '125', 'Individual', 'new customer', '1784717790891-apple-macbook-pro-stock-2021-apple-event-2021-white-3840x2160-6758.jpg', '2026-07-22 10:56:30'),
(2, 3, 'yasinduRandula', '940081456l', '0710377941', 'evecoollll', 'No125/1,nupe, matara11', 'yase1@gmail.com', '78456214711', 'Individual', 'Aircondition11', '1784795756301-apple-macbook-pro-stock-2021-apple-event-2021-white-3840x2160-6758.jpg', '2026-07-23 08:16:15');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `invoice_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `paid_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `balance_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('Paid','Partial','Unpaid') NOT NULL DEFAULT 'Unpaid',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `customer_id`, `invoice_number`, `invoice_date`, `due_date`, `subtotal`, `discount`, `tax_percent`, `tax_amount`, `total_amount`, `paid_amount`, `balance_amount`, `status`, `notes`, `created_at`) VALUES
(1, 1, 1, 'INV-01', '2026-07-25', '2026-07-31', 1375.00, 9.99, 0.00, 0.00, 1365.01, 999.95, 365.06, 'Partial', 'cash', '2026-07-25 02:55:35'),
(2, 1, 1, 'INV-02', '2026-07-25', '2026-08-04', 998.91, 0.00, 0.00, 0.00, 998.91, 99.70, 899.21, 'Partial', 'cheque', '2026-07-25 03:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(12,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `amount`, `created_at`) VALUES
(1, 1, 1, 'AppleIphone', 11, 125.00, 1375.00, '2026-07-25 02:55:35'),
(2, 2, 2, 'cec', 9, 110.99, 998.91, '2026-07-25 03:09:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `product_code` varchar(50) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `cost_price` decimal(10,2) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `unit` varchar(30) DEFAULT 'pcs',
  `expire_date` date DEFAULT NULL,
  `rack_no` varchar(50) DEFAULT NULL,
  `zone_number` varchar(50) DEFAULT NULL,
  `supplier` varchar(150) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `user_id`, `product_name`, `product_code`, `category`, `price`, `cost_price`, `quantity`, `unit`, `expire_date`, `rack_no`, `zone_number`, `supplier`, `description`, `image`, `created_at`) VALUES
(1, 1, 'AppleIphone', '4521222', 'mobileeeee', 125.00, 14.00, 1, 'litre', '2026-07-07', '7', '7', 'rrrr', 'rrrrr', '1784798070803-mac2.png', '2026-07-23 08:56:15'),
(2, 1, 'cec', 'cccec', 'ecec', 110.99, 2112.00, 12, 'kg', '2026-08-07', '7', '14', 'wdqddwdeqed', 'cscdee', '1784797949019-apple-macbook-pro-stock-2021-apple-event-2021-white-3840x2160-6758.jpg', '2026-07-23 09:05:17');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `id_number` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `id_number`, `email`, `password`, `created_at`) VALUES
(1, 'Lahiru Kavinga', '960080610v', 'lkspathirana@gmail.com', '$2b$10$AYMwEaz74woqom/6UC0/keZdiad2Hq.kcG038N0G8E4FoUXbFEk76', '2026-07-22 10:14:44'),
(3, 'kasun sampath', '980080610v', 'kasun@gmail.com', '$2b$10$0RpcULycblJdSBWVJJWLP.M4Nf5ZTiihoBnM3PzhHmMjeNMhC7LlS', '2026-07-22 10:21:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_invoice_per_user` (`user_id`,`invoice_number`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `id_number` (`id_number`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
