'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Settings, Plus, FileText, Users, TrendingUp, ChevronDown, Search, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  userOrganizations?: Array<{
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface QuoteData {
  name: string;
  value: number;
  color: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Sample data for the pie chart - in real app, this would come from API
  const quoteData: QuoteData[] = [
    { name: 'Accepted', value: 12, color: '#2563EB' }, // blue-600 - matches button color
    { name: 'Not Accepted', value: 8, color: '#60A5FA' }, // blue-400 - lighter blue for contrast
  ];

  const totalQuotes = quoteData.reduce((sum, item) => sum + item.value, 0);
  const acceptedQuotes = quoteData.find(item => item.name === 'Accepted')?.value || 0;
  const notAcceptedQuotes = quoteData.find(item => item.name === 'Not Accepted')?.value || 0;
  const acceptanceRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalQuotes > 0 ? Math.round((data.value / totalQuotes) * 100) : 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} quotes ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }
    }

    // Verify token with backend
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      if (!user) {
        router.push('/auth/login');
      }
    }, 5000); // 5 second timeout

    verifyToken(token);

    return () => clearTimeout(timeoutId);
  }, [router]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Check if user has completed quick setup
        const organization = data.data.userOrganizations?.[0]?.organization;
        if (!organization || !organization.name || organization.name.trim() === '') {
          // User hasn't completed quick setup, redirect to quick setup
          router.push('/quick-setup');
          return;
        }
      } else {
        // Token is invalid, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
        return;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth/login');
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Blue Navigation Bar */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Navigation Links */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <button className={`px-3 py-2 rounded-md text-sm font-medium relative ${
                  true ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}>
                  Dashboard
                  {true && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                  )}
                </button>
                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  Quotes
                </button>
                <button 
                  onClick={() => router.push('/dashboard/contacts')}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Contacts
                </button>
                <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                  Templates & Items
                </button>
              </div>
            </div>
            
            {/* Right Side - Search and User Profile */}
            <div className="flex items-center space-x-4">
              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-700 text-white">
                    <span className="text-sm text-gray-300">
                      {user.userOrganizations?.[0]?.organization?.name || 'Company Name Not Set'}
                    </span>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center gap-2"
                    onClick={() => router.push('/dashboard/settings')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and New Quote Row */}
        <div className="flex items-center mb-8 gap-6">
          <Button 
            onClick={() => router.push('/dashboard/quotes/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium w-[20%] flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Quote
          </Button>
          
          {/* Spacer */}
          <div className="flex-1"></div>
          
          {/* Search Input */}
          <div className="relative w-[50%] flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Quote Title, Number or Contact..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 50/50 Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Quote Management & Checklist */}
          <div className="space-y-6">
            {/* Quote Status Tabs */}
            <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'active' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('waiting')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'waiting' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Waiting
              </button>
            </div>

            {/* Draft Quotes Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Draft
                </span>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Web Design Proposal Example</h3>
                    <p className="text-sm text-gray-500">by {user.name} #1</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">₹10,549.00</p>
                    <p className="text-sm text-gray-500">4 mins ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Getting Started Checklist */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started Checklist</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Start with a</span>
                  <select className="ml-2 px-3 py-1 border border-gray-300 rounded-md text-sm bg-white">
                    <option>Sample quote</option>
                  </select>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Add your logo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Send a Quote</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Invite a Team Member</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">Get a Quote Accepted</span>
                </div>
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                I'm done with the checklist
              </button>
            </div>
          </div>

          {/* Right Column - Performance Summary */}
          <div className="space-y-6">
            {/* Quote Acceptance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{acceptedQuotes}</p>
                    <p className="text-sm text-gray-500">Quotes Accepted</p>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{notAcceptedQuotes}</p>
                    <p className="text-sm text-gray-500">Not Accepted</p>
                  </div>
                </div>
                
                {/* Pie Chart */}
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={quoteData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {quoteData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => (
                          <span style={{ color: '#374151', fontSize: '12px' }}>
                            {value} ({quoteData.find(item => item.name === value)?.value || 0})
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Acceptance Rate */}
                  <div className="text-center mt-4">
                    <p className="text-3xl font-bold text-gray-900">{acceptanceRate}%</p>
                    <p className="text-sm text-gray-500">Acceptance Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline/Trend Graph */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              
              {/* Graph Placeholder */}
              <div className="relative h-32 bg-gray-50 rounded-lg mb-4 flex items-end">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                <div className="absolute bottom-0 left-4 w-2 h-2 bg-blue-500 rounded-full transform translate-y-1"></div>
                <div className="absolute bottom-0 right-0 text-sm text-gray-500">0</div>
              </div>
              
              {/* Date Labels */}
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>14 July</span>
                <span>21 July</span>
                <span>28 July</span>
                <span>4 August</span>
              </div>
              
              {/* Dropdown Selectors */}
              <div className="space-y-2">
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Display from: 30 days ago</option>
                </select>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Display as: Total value</option>
                </select>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                  <option>Rolling total: 30 day</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Notification - Bottom Centered */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
            <p className="text-gray-700 mb-2">Quotient is FREE for 14 more days</p>
            <p className="text-sm text-gray-500">
              To continue beyond your trial, please{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                add your payment details
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 