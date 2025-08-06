# DINO-v5 🌏

A Digital Nomad visa tracking application for managing stay durations across multiple countries. Helps US passport holders track their visa compliance and remaining days in each country.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

## ✨ Features

### Travel Tracking
- **From/To Travel Flow**: Track origin and destination countries with airport codes
- **Ongoing Stays**: Support for current trips with optional exit dates
- **Visa Types**: Track visa-free, e-visa, visa-on-arrival, and other entry types
- **Airport Codes**: Record entry and exit airports (ICN, BKK, NRT, etc.)

### Visa Compliance
- **Rolling Windows**: 90/180-day rules for Japan and Schengen
- **Simple Reset**: Per-entry limits for Korea, Thailand, Vietnam
- **Real-time Warnings**: Visual alerts when approaching limits
- **Progress Tracking**: Color-coded progress bars for each country

### Smart UI
- **Conditional Components**: UI elements only show when relevant data exists
- **Material Design 3**: Google-style interface with smooth transitions
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching

### Data Management
- **Local Storage**: Offline-first with localStorage persistence
- **Supabase Sync**: Cloud backup and cross-device synchronization
- **Real-time Updates**: Live data synchronization across sessions
- **Data Export**: Export travel history for visa applications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, works offline)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/DINO-v5.git
cd DINO-v5

# Install dependencies
npm install

# Set up environment variables (optional)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Setup

```bash
# .env.local (optional for Supabase integration)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Usage

### Adding Travel Records

1. **Click the + (FAB) button** in the sidebar
2. **Fill the From/To form**:
   - From Country: Where you departed from
   - Departure Airport: Airport code (optional)
   - To Country: Your destination
   - Arrival Airport: Airport code (optional)
   - Visa Type: Select appropriate visa type
   - Entry Date: When you entered
   - Exit Date: When you left (optional for ongoing stays)
   - Notes: Additional information

3. **Click "Add Record"** to save

### Monitoring Visa Status

- **Dashboard**: Overview of countries visited and total days
- **Calendar View**: Visual representation of your travel timeline
- **Visa Windows**: Real-time compliance status for each country
- **Warnings**: Alerts when approaching visa limits

### Supported Countries

| Country | Visa Rule | Limit | Window |
|---------|-----------|-------|---------|
| 🇰🇷 Korea | Per Entry | 90 days | - |
| 🇯🇵 Japan | Rolling Window | 90 days | 180 days |
| 🇹🇭 Thailand | Per Entry | 30 days | Extendable +30 |
| 🇻🇳 Vietnam | Per Entry | 45 days | - |

## 🏗️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Material-UI (MUI) + Material Design 3
- **Database**: Supabase (PostgreSQL)
- **State Management**: React hooks (useState, useEffect)
- **Storage**: localStorage with Supabase sync

## 📁 Project Structure

```
DINO-v5/
├── app/                    # Next.js 14 App Router
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── layout.tsx     # Layout with sidebar
│   │   └── [country]/     # Dynamic country pages
│   └── api/               # API routes
├── components/            # React components
│   ├── calendar/         # Calendar and visa tracking
│   ├── sidebar/          # Navigation and modals
│   ├── stays/           # Travel record management
│   └── auth/            # Authentication components
├── lib/                   # Utilities and logic
│   ├── visa-rules/       # Visa rule engine
│   ├── calculations/     # Stay duration calculations
│   ├── supabase/        # Database integration
│   └── storage/         # localStorage utilities
└── supabase/             # Database schemas and migrations
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Enhanced stays table with From/To structure
CREATE TABLE stays (
  id UUID PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,    -- Destination (To)
  from_country VARCHAR(2),             -- Origin (From)
  entry_date DATE NOT NULL,
  exit_date DATE,                      -- Nullable for ongoing
  entry_city VARCHAR(5),               -- Airport codes
  exit_city VARCHAR(5),
  visa_type VARCHAR(50),
  notes TEXT
);
```

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema documentation.

## 🧩 Component Architecture

### Key Components

- **Sidebar**: Navigation with integrated "Add Stay" modal
- **StayManager**: Enhanced form with From/To structure
- **VisaWindows**: Real-time compliance monitoring
- **CalendarCountryFilter**: Smart filtering based on data
- **RollingCalendar**: Visual timeline with conditional indicators

See [COMPONENTS.md](./COMPONENTS.md) for detailed component documentation.

## 🔧 Development

### Commands

```bash
# Development
npm run dev          # Start dev server (open in new terminal)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:migrate   # Run Supabase migrations
npm run db:reset     # Reset database
npm run db:seed      # Seed with sample data
```

### Development Notes

- **Always open dev server in a new terminal window**
- **Read CLAUDE.md before making changes** (AI workflow guidance)
- **Follow Material Design 3 patterns**
- **Test both online and offline modes**

### Code Style

- TypeScript with strict mode
- Material-UI component patterns
- Functional components with hooks
- Conditional rendering for data-dependent UI
- Error boundaries for graceful failures

## 🔄 Recent Updates (v5.0)

### ✅ From/To Travel Structure
- Enhanced forms with origin/destination flow
- Airport code tracking (entry_city, exit_city)
- Visa type selection with country-specific options
- Support for ongoing stays (nullable exit dates)

### ✅ UI/UX Improvements
- Conditional rendering - components only show with relevant data
- Material Design 3 styling with Google Sans fonts
- Improved form validation and error handling
- Responsive design for all screen sizes

### ✅ Database Enhancements
- Added from_country, entry_city, exit_city, visa_type columns
- Made exit_date nullable for ongoing stays
- Performance indexes for frequently queried columns
- Foreign key constraints with proper cascading

### ✅ Developer Experience
- Comprehensive documentation (DATABASE_SCHEMA.md, COMPONENTS.md)
- Type-safe interfaces with helper functions
- Offline-first architecture with cloud sync
- Migration system for schema updates

## 🚦 Visa Logic

### Reset Types

1. **Simple Reset (`exit`)**: Counter resets when leaving the country
   - Korea: 90 days per entry
   - Thailand: 30 days per entry (extendable by 30)
   - Vietnam: 45 days per entry

2. **Rolling Window (`rolling`)**: Days calculated within a moving window
   - Japan: 90 days within any 180-day period

### Calculations

- **Stay Duration**: Always includes both entry and exit dates (+1 day)
- **Rolling Windows**: Calculates overlap between stay dates and the rolling period
- **Ongoing Stays**: Calculates days from entry to today
- **Progress Indicators**: Green < 60%, Yellow 60-80%, Red > 80%

## 📊 Analytics & Insights

- Countries visited count
- Total days traveled
- Visa compliance status
- Remaining days per country
- Travel timeline visualization

## 🔐 Privacy & Security

- **Local-first**: Data stored in browser localStorage
- **Optional Cloud Sync**: Supabase integration for backup
- **No Tracking**: No analytics or third-party tracking
- **Open Source**: Full transparency in code and data handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. Read [CLAUDE.md](./CLAUDE.md) for AI workflow guidance
2. Check [COMPONENTS.md](./COMPONENTS.md) for component patterns
3. Review [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for data structure
4. Follow TypeScript and Material-UI best practices
5. Test both online and offline functionality

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing React framework
- **Material-UI** for the beautiful component library
- **Supabase** for the backend-as-a-service platform
- **Digital Nomad Community** for inspiration and feedback

## 📞 Support

- 📧 Email: support@dino-v5.com
- 💬 Discord: [Join our community](https://discord.gg/dino-v5)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/DINO-v5/issues)
- 📖 Docs: [Wiki](https://github.com/yourusername/DINO-v5/wiki)

---

**Made with ❤️ for Digital Nomads around the world** 🌍