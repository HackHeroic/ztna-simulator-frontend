# ZTNA VPN Simulator - Frontend

A modern React-based frontend for the Zero Trust Network Access (ZTNA) VPN Simulator. This application provides a comprehensive dashboard for managing VPN connections, monitoring security events, and simulating attack scenarios.

## Features

- **VPN Management Dashboard**: Connect, disconnect, and monitor VPN connections
- **Real-time Activity Logs**: View continuous authentication events and connection activities
- **Security Overview**: Monitor anomalies, risk scores, and access attempts
- **Attack Simulator**: Test security policies with various attack scenarios
- **Role-Based Access Control**: Different views based on user clearance levels
- **Threat Intelligence**: View and manage threat users (clearance level 3+)
- **Admin Tools**: Manage resources, risk factors, and policies (admin only)

## Prerequisites

- Node.js 16+ and npm
- Backend services running (Auth Server, VPN Gateway, Policy Engine)

## Installation

1. Navigate to the frontend directory:
```bash
cd ztna-simulator-frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── api/              # API client functions
│   ├── api.js        # General API utilities
│   ├── policyApi.js  # Policy engine API calls
│   └── vpnApi.js     # VPN gateway API calls
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   │   ├── AttackSimulator.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ThreatUsersPanel.jsx
│   │   ├── AdminUserLogs.jsx
│   │   └── ...
│   ├── ui/           # Reusable UI components
│   └── VpnPanel.jsx  # VPN Backend Dashboard
├── hooks/            # Custom React hooks
│   └── useDashboardData.js
├── utils/            # Utility functions
│   ├── userUtils.js  # User role/clearance utilities
│   ├── formatUtils.js
│   └── riskUtils.js
└── App.js            # Main application component
```

## Key Components

### VPN Backend Dashboard (`VpnPanel.jsx`)
- Standalone VPN management interface
- Real-time connection monitoring
- Activity logs with continuous auth events
- Automatic disconnect on window close or internet loss

### Main Dashboard (`Dashboard.jsx`)
- Comprehensive security overview
- Role-based component visibility
- Attack simulation tools
- Threat intelligence panel (clearance 3+)
- Admin tools (clearance 5+)

### Attack Simulator
- Quick attack scenarios (Pyongyang login, rooted device, etc.)
- Extreme attack scenarios (critical threats)
- Backend-defined scenarios
- Detailed payload analysis
- Policy evaluation breakdown

## User Roles and Clearance Levels

- **Clearance 1**: Basic user - VPN access only
- **Clearance 2**: Standard user - Can view access logs
- **Clearance 3**: Security analyst - Can view threat users
- **Clearance 4**: Security admin - Can update threat users
- **Clearance 5**: Admin - Full access to all features

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE=http://localhost:5000
REACT_APP_VPN_API_BASE=http://localhost:5001
REACT_APP_POLICY_API_BASE=http://localhost:5002
```

## Features

### Automatic Disconnect
- VPN connections automatically disconnect when:
  - Browser window is closed
  - Internet connection is lost
  - User navigates away

### Continuous Authentication Monitoring
- Real-time display of continuous auth checks
- Risk score tracking
- Policy status updates

### Threat Intelligence
- View threat users based on clearance level
- Detailed threat activity logs
- Threat level indicators (critical, high, medium)

## Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## Troubleshooting

### Connection Issues
- Ensure all backend services are running
- Check CORS settings in backend
- Verify API endpoints in `src/api/` files

### Authentication Issues
- Check token expiration
- Verify JWT secret matches backend
- Clear localStorage and re-login

## Development

### Adding New Components
1. Create component in appropriate directory
2. Import and add to Dashboard.jsx
3. Add API calls if needed in `src/api/`
4. Update user utilities for role-based access

### Styling
- Uses Tailwind CSS
- Custom components in `src/components/ui/`
- Consistent color scheme: orange/amber for security, blue for VPN

## License

See LICENSE file for details.
