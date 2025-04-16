# 🚗 RideShare

> A smart, scalable, and intuitive ride-sharing web application connecting **drivers** and **passengers** through real-time technology, transparent workflows, and a seamless user experience.



## 📌 Overview

**RideShare** is a full-stack ride-sharing platform engineered to offer a **secure**, **eco-friendly**, and **efficient** urban transport experience. With dedicated portals for both **passengers** and **drivers**, the system handles end-to-end ride coordination — from booking to payment — while ensuring real-time updates, seamless user onboarding, and scalable architecture for future growth.

Built using **MERN stack**, Razorpay, and scalable MongoDB schemas, it features optimized backend logic, real-world event handling, and robust user state management.



## ✨ Key Features

- 🔐 **Dual Portal**: Separate login flows for passengers and drivers  
- 🧠 **Smart Ride Matching**: Real-time request broadcasting to nearby drivers  
- 📍 **Location-based Filtering**: Ride creation and joining based on seat/time/place  
- 💳 **Secure Payments**: Integrated Razorpay checkout and signature verification  
- 🚦 **Dynamic Ride Lifecycle**: Auto-updated ride states (`scheduled`, `ongoing`, `completed`)  
- 📈 **Admin-free Coordination**: First-come-first-serve driver assignment logic  
- 📊 **Scalable Design**: Cleanly separated schema logic and controller responsibilities



## 🧠 How the System Works

### 👤 Passenger Flow
1. Login via passenger portal  
2. View available rides (if seats are free)  
3. Choose to:  
   - **Join** an existing ride (instant join)  
   - **Create** a new ride (requests broadcast to all drivers)  
4. Await driver acceptance  
5. Ride begins → passenger pays after drop  
6. Status auto-updates as ride progresses  

### 🚗 Driver Flow
1. Login via driver portal  
2. Receive broadcasted requests (first driver to accept gets the ride)  
3. Manage scheduled/ongoing rides  
4. Start ride → collect payment → end ride when complete  



## 🧩 Technical Architecture

- **Frontend**: React.js (Vite), Tailwind CSS, Google OAuth  
- **Backend**: Node.js, Express.js, MongoDB, Razorpay SDK  
- **Database**: Mongoose models for users, rides, drivers, ratings, payments  
- **Auth**: JWT cookies (secure, scoped by portal)  
- **Payments**: Razorpay Orders + Signature verification  



## 🖼️ Diagrams & Design Assets

> All major planning, design, and demonstration resources are available below:

| Type | Link |
|------|------|
| 🧑‍🏫 Mentor Notes + Design Drafts | [Discussions & Drafts](https://docs.google.com/document/d/1z1NA7evjcSxYlqUGdsJr2_i69N3A6hCUuGT9BcQQCGg/edit?usp=sharing) |
| 📃 BRD – Business Requirements | [View BRD](https://docs.google.com/document/d/1UHv8fVt0MKs4Zq6iB7Z_kER3EvoJWWKRLxF-UzSRmIQ/edit?usp=sharing) |
| 📘 SRS – Software Requirements | [View SRS](https://docs.google.com/document/d/1qNyec1TKy8n5svkEe9PDR6_u-D6mcSFK_bpQMwyhsfo/edit?usp=sharing) |
| 🧱 System Architecture – Physical View | [Physical View](https://docs.google.com/document/d/1P0ebFM5bo7HwdasGPTsim7UIKWqfNJjB8Z93gi2HZiU/edit?usp=sharing) |
| 🧠 System Architecture – Logical View | [Logical View](https://docs.google.com/document/d/1bxy8Y_XrF84Wq-FcCjxlzpk6nuhIKjQ4AuCiZlj0HuA/edit?usp=sharing) |
| 🧭 UML Diagrams (Class, State, Activity, Use Case, Sequence) | [View UML Folder](https://drive.google.com/drive/folders/1vCTmyDwT-tOc29LXA0HLPO6WlJ9SKMdr?usp=sharing) |
| 🎥 Progress Presentation (Regular Evaluation) | [Gamma Deck](https://gamma.app/docs/RideShare-Web-Application-Progress-Report-n49wlp9segrigm9?mode=doc) |
| 📽️ Demonstration Videos (Working + Architecture) | [Demo Videos Folder](https://drive.google.com/drive/folders/1y7KzNqx43zILI39Rfwc2rPu8QNLenrpm?usp=sharing) |



## 👥 Team

This project was built with collaboration, innovation, and hard work by:

- 👨‍💻 [I. Anders Arnold](https://github.com/asquare004)  
- 👨‍🔧 [Krish Gujarati](https://github.com/Krish-Gujarati)  
- 👩‍💻 [Swathi Vinod Chavan](https://github.com/swathivc)
