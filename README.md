# 🏠 FarmHouse - Modern Livestock Management System

A comprehensive farm management system with AI-powered insights, multilingual support, and role-based access control for efficient livestock operations.

## 🌟 Features

### 🏢 **4-Tier Role-Based Access Control**
- **Super Admin**: Complete system oversight and user management
- **Admin**: Farmhouse management and staff oversight
- **Manager**: Daily operations and team coordination
- **Assistant**: Basic data entry and monitoring tasks

### 🐄 **Animal Management**
- Complete animal records with breeding history
- Health tracking and medical records
- Lineage management and pedigree tracking
- Weight monitoring and growth analytics
- Location and status tracking

### 🧬 **Breeding Management**
- AI-powered breeding recommendations
- Genetic compatibility analysis
- Breeding history tracking
- Success rate analytics
- Scheduled breeding programs

### 🏡 **Farmhouse Management**
- Multi-location farmhouse support
- Staff assignment and management
- Location-based analytics
- Resource allocation tracking

### 🛒 **Product Marketplace**
- Integrated e-commerce platform
- Stripe payment processing
- Order management system
- Inventory tracking
- Shopping cart functionality

### 🔔 **Real-time Notifications**
- WebSocket-based real-time alerts
- Incident tracking and reporting
- Maintenance scheduling
- Health alerts and reminders

### 🤖 **AI Features**
- **AI Breeding Recommendations**: Genetic analysis and compatibility scoring
- **AI Chatbot**: Intelligent customer support and farm assistance
- Predictive analytics for health and breeding outcomes

### 🌍 **Multilingual Support**
- **5 Languages**: English, French, Yoruba, Hausa, Igbo
- Dynamic language switching
- Localized content and interfaces

### 📊 **Analytics & Reporting**
- Real-time dashboard with key metrics
- Breeding success analytics
- Health trend analysis
- Financial reporting
- Export capabilities (CSV, PDF)

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Stripe** for payment processing
- **Cloudinary** for file uploads
- **Swagger** for API documentation

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Radix UI** components
- **Next-intl** for internationalization
- **Recharts** for data visualization

### AI & ML
- AI-powered breeding recommendations
- Intelligent chatbot system
- Predictive analytics

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Stripe account for payments
- Cloudinary account for file uploads

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/zarnabali/FarmHouse.git
cd FarmHouse
```

2. **Install Backend Dependencies**
```bash
cd farmHomeBackend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../farmHomeFrontend
npm install
```

4. **Environment Setup**

Create `.env` file in `farmHomeBackend/`:
```env
PORT=5000
MONGO_USER=your_mongodb_username
MONGO_PASS=your_mongodb_password
DATABASE_NAME=farmhouse_db
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONT_END_URL=http://localhost:3000
```

Create `.env.local` file in `farmHomeFrontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

5. **Start the Development Servers**

Backend:
```bash
cd farmHomeBackend
npm start
```

Frontend:
```bash
cd farmHomeFrontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

## 📁 Project Structure

```
FarmHouse/
├── farmHomeBackend/          # Backend API
│   ├── middleware/           # Authentication & authorization
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── uploads/             # File uploads
│   └── utils/               # Helper functions
├── farmHomeFrontend/        # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── messages/            # i18n translations
│   └── lib/                 # Utilities
```

## 🔐 Authentication & Authorization

The system implements role-based access control with JWT tokens:

- **Super Admin**: Full system access
- **Admin**: Farmhouse management
- **Manager**: Operational oversight
- **Assistant**: Basic data access

## 💳 Payment Integration

- Stripe payment processing
- Secure checkout flow
- Order management
- Payment history tracking

## 🌐 API Documentation

Access the interactive API documentation at:
`http://localhost:5000/api/docs`

## 📱 Features by Role

### Super Admin
- User management across all farmhouses
- System-wide analytics and reporting
- Global settings and configurations

### Admin
- Farmhouse creation and management
- Staff assignment and oversight
- Financial reporting and analytics

### Manager
- Daily operations management
- Team coordination
- Incident response and tracking

### Assistant
- Data entry and record keeping
- Basic monitoring and reporting
- Health record management

## 🤖 AI Features

### Breeding Recommendations
- Genetic compatibility analysis
- Historical success rate evaluation
- Optimal breeding timing suggestions

### AI Chatbot
- Natural language processing
- Farm management assistance
- Customer support automation

## 📊 Analytics & Reporting

- Real-time dashboard with key metrics
- Breeding success analytics
- Health trend analysis
- Financial reporting
- Export capabilities (CSV, PDF)

## 🌍 Internationalization

Support for 5 languages:
- English (en)
- French (fr)
- Yoruba (yo)
- Hausa (ha)
- Igbo (lg)

## 🔧 Development

### Available Scripts

Backend:
```bash
npm start          # Start development server
npm test           # Run tests
```

Frontend:
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🤝 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI analytics
- [ ] IoT sensor integration
- [ ] Blockchain integration for traceability
- [ ] Advanced reporting features
- [ ] Third-party integrations

---

**FarmHouse** - Modernizing livestock management with AI-powered insights and comprehensive farm oversight.

