This is a full-stack eCommerce web application built using React (Vite) for the frontend and Django + Django REST Framework for the backend. It includes essential features required for an online shopping platform and demonstrates integration with payment gateways, cloud storage, and APIs.

🌐 Live Demo

Frontend live link: https://react-django-ecommerce-frontend.vercel.app/

⚠️ Note: The backend is hosted on Render (free tier). Due to free-tier limitations, the server may take some time to wake up if inactive.
If the frontend shows a network error, please try again after a few minutes.
For any critical issues, contact: 📧 rudrampanchal@gmail.com
.
✨ Features

User Authentication:

Login, Registration, Logout

Forgot Password functionality

JWT token authentication stored in localStorage

Product Management:

View products with search and filtering options

Add to Cart functionality

Cart persistence using local storage

Product images uploaded and served from Cloudinary

Order and Payment:

Stripe payment integration

Place orders and view order history

APIs:

Multiple REST APIs for user, product, cart, and order management

Full CRUD support for products via backend APIs

Frontend Features:

Developed with React and Vite for fast performance

Responsive design and clean UI

Backend Features:

Django + Django REST Framework

PostgreSQL/MySQL database hosted on Render

Cloudinary for media storage

Handles multiple API requests and validations

🛠 Tech Stack

Frontend: React, Vite, JavaScript, HTML, CSS

Backend: Django, Django REST Framework, Python

Database: Hosted on Render

Cloud Storage: Cloudinary for product images

Payment Gateway: Stripe

Deployment: Vercel (Frontend), Render (Backend + Database)

🚀 Installation & Setup
Python & Backend Setup

Requirements:

Python >= 3.11

pip >= 23.x

Clone the repository:

git clone <repo-url>
cd backend


Create a virtual environment and activate:

python -m venv env
source env/bin/activate  # Linux/Mac
env\Scripts\activate     # Windows


Install dependencies (from requirements.txt):

pip install --upgrade pip
pip install -r requirements.txt


Apply database migrations:

python manage.py migrate


Start the development server:

python manage.py runserver


🔴 Important: To recreate the environment with the latest versions of packages, delete the env folder and repeat the steps above. This ensures updated libraries are installed.

Frontend (React + Vite)

Navigate to frontend folder:

cd frontend


Install dependencies:

npm install


Start the development server:

npm run dev


✅ Note: Frontend is hosted on Vercel, so no additional setup is needed for deployment.

📄 requirements.txt (example)

Here is a reference list of dependencies for the backend:

Django>=4.2
djangorestframework>=3.14
django-cors-headers>=4.0
Pillow>=10.0
psycopg2-binary>=2.9  # PostgreSQL support
stripe>=6.0
cloudinary>=2.0
python-dotenv>=1.0


🔴 Tip: Install the latest versions by recreating the virtual environment. Use pip install --upgrade <package> if needed.

⚠️ Notes

Free-tier hosting may cause occasional downtime; the backend server may take ~15 minutes to wake up after inactivity.

Stripe payments are fully functional in test mode.

All user and product data are validated for security and consistency.

Local storage is used for tokens and cart persistence, so ensure your browser allows it.

📧 Contact

For any issues, suggestions, or feedback:
Email: rudrampanchal@gmail.com
