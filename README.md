# Fertilizer Inventory Management System

A comprehensive multi-tenant inventory management system designed specifically for fertilizer retailers and distributors. Built with React, TypeScript, and Supabase.

## 🚀 Features

- **Multi-tenant Architecture** - Support for multiple businesses with isolated data
- **Inventory Management** - Track stock levels, movements, and stock takes
- **Purchase Management** - Record and manage supplier purchases with enhanced forms
- **Sales & POS** - Point of sale system with customer management
- **Supplier Management** - Manage suppliers and payment tracking
- **E-invoicing** - Generate and manage electronic invoices
- **Reports & Analytics** - Comprehensive reporting and dashboard analytics
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build Tool**: Vite
- **State Management**: React Hook Form, Context API
- **Charts**: Recharts
- **PDF Generation**: React-PDF
- **QR Codes**: QRCode.react

## 📋 Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/D4rkC0m3t/Multi-Tenency.git
cd Multi-Tenency
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run prepare` - Run all quality checks

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── inventory/      # Inventory management
│   ├── purchases/      # Purchase management
│   ├── sales/          # Sales and POS
│   ├── suppliers/      # Supplier management
│   └── common/         # Shared components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run the SQL migrations in the `supabase/` directory
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

### Environment Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Deploy the `dist` folder to your hosting provider
```

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📊 Code Quality

This project uses several tools to maintain code quality:

- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type safety
- **Husky** - Git hooks for quality checks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run quality checks: `npm run prepare`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/D4rkC0m3t/Multi-Tenency/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/D4rkC0m3t/Multi-Tenency/discussions)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [Material-UI](https://mui.com/)
- Backend powered by [Supabase](https://supabase.com/)
- Icons from [Material Icons](https://mui.com/material-ui/material-icons/)

## 📈 Roadmap

- [ ] Enhanced Purchase Form (In Progress)
- [ ] Advanced Reporting Dashboard
- [ ] Mobile App (React Native)
- [ ] API Documentation
- [ ] Multi-language Support
- [ ] Advanced Analytics
- [ ] Integration with Accounting Software

---

Made with ❤️ for fertilizer retailers and distributors