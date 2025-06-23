import { User, Business, Customer, Job, Estimate, Invoice, InventoryItem } from '../types';

export const mockBusiness: Business = {
  id: 'biz-1',
  name: 'Memphis Pro Services',
  primaryTrade: 'hvac',
  secondaryTrades: ['electrical'],
  businessType: 'team',
  address: '1234 Union Ave, Memphis, TN 38104',
  timezone: 'America/Chicago',
  serviceAreaZipcodes: ['38104', '38105', '38106', '38107', '38108', '38111', '38112', '38114', '38115'],
  phone: '(901) 555-0123',
  email: 'office@memphispro.com',
  certifications: ['EPA 608', 'NATE Certified'],
  setupComplete: false
};

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah@memphispro.com',
    role: 'admin',
    phone: '(901) 555-0100',
    businessId: 'biz-1'
  },
  {
    id: 'user-2',
    name: 'Mike Rodriguez',
    email: 'mike@memphispro.com',
    role: 'technician',
    phone: '(901) 555-0101',
    businessId: 'biz-1'
  },
  {
    id: 'user-3',
    name: 'James Wilson',
    email: 'james@memphispro.com',
    role: 'technician',
    phone: '(901) 555-0102',
    businessId: 'biz-1'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    businessId: 'biz-1',
    name: 'Jennifer Davis',
    phone: '(901) 555-0200',
    email: 'jennifer.davis@email.com',
    address: '2456 Poplar Ave, Memphis, TN 38112',
    tags: ['residential', 'repeat-customer', 'midtown'],
    notes: 'Prefers morning appointments. Has two HVAC units - main floor and upstairs.',
    totalRevenue: 1250.00,
    lastContact: new Date('2024-01-15'),
    jobCount: 5,
    propertyType: 'residential'
  },
  {
    id: 'cust-2',
    businessId: 'biz-1',
    name: 'Downtown Office Complex',
    phone: '(901) 555-0201',
    email: 'facilities@downtowncomplex.com',
    address: '789 Main St, Memphis, TN 38103',
    tags: ['commercial', 'monthly-service', 'downtown'],
    notes: 'Large commercial account with 12 HVAC units. Contact property manager first.',
    totalRevenue: 15750.00,
    lastContact: new Date('2024-01-20'),
    jobCount: 18,
    propertyType: 'commercial'
  },
  {
    id: 'cust-3',
    businessId: 'biz-1',
    name: 'Beale Street Apartments',
    phone: '(901) 555-0202',
    email: 'maintenance@bealeapts.com',
    address: '1122 Beale St, Memphis, TN 38103',
    tags: ['rental', 'emergency-service', 'downtown'],
    notes: 'Property management company. Multiple units, quick turnaround needed.',
    totalRevenue: 3250.00,
    lastContact: new Date('2024-01-18'),
    jobCount: 8,
    propertyType: 'rental'
  },
  {
    id: 'cust-4',
    businessId: 'biz-1',
    name: 'Germantown HOA',
    phone: '(901) 555-0203',
    email: 'board@germantownhoa.com',
    address: '5500 Poplar Ave, Memphis, TN 38119',
    tags: ['hoa', 'scheduled-maintenance', 'germantown'],
    notes: 'HOA community with 45 units. Quarterly maintenance contracts.',
    totalRevenue: 8900.00,
    lastContact: new Date('2024-01-22'),
    jobCount: 12,
    propertyType: 'hoa'
  },
  {
    id: 'cust-5',
    businessId: 'biz-1',
    name: 'Memphis Medical Center',
    phone: '(901) 555-0204',
    email: 'facilities@memmedical.com',
    address: '1000 Union Ave, Memphis, TN 38104',
    tags: ['commercial', 'priority-service', 'medical'],
    notes: 'Critical facility - 24/7 HVAC requirements. Emergency contact required.',
    totalRevenue: 22500.00,
    lastContact: new Date('2024-01-25'),
    jobCount: 25,
    propertyType: 'commercial'
  },
  {
    id: 'cust-6',
    businessId: 'biz-1',
    name: 'Cooper-Young Bistro',
    phone: '(901) 555-0205',
    email: 'manager@cybistro.com',
    address: '2144 Young Ave, Memphis, TN 38104',
    tags: ['commercial', 'restaurant', 'cooper-young'],
    notes: 'Restaurant with specialized kitchen HVAC needs. Avoid lunch hours.',
    totalRevenue: 4800.00,
    lastContact: new Date('2024-01-19'),
    jobCount: 9,
    propertyType: 'commercial'
  }
];

// Generate comprehensive job data for the current period
const generateRealisticJobs = (): Job[] => {
  const jobs: Job[] = [];
  const today = new Date();
  
  // Get current week start (Monday)
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay() + 1);
  
  // Generate jobs for 4 weeks (2 weeks back, current week, 1 week forward)
  for (let weekOffset = -2; weekOffset <= 1; weekOffset++) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() + (weekOffset * 7));
    
    // Generate jobs for each day of the week
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + dayOffset);
      
      // Skip some Sundays (reduced schedule)
      if (currentDate.getDay() === 0 && Math.random() > 0.3) continue;
      
      // Determine number of jobs for this day
      let jobsPerDay;
      if (currentDate.getDay() === 0) { // Sunday
        jobsPerDay = Math.floor(Math.random() * 2); // 0-1 jobs
      } else if (currentDate.getDay() === 6) { // Saturday
        jobsPerDay = Math.floor(Math.random() * 3) + 1; // 1-3 jobs
      } else { // Weekdays
        jobsPerDay = Math.floor(Math.random() * 4) + 2; // 2-5 jobs
      }
      
      // Generate jobs for this day
      for (let jobIndex = 0; jobIndex < jobsPerDay; jobIndex++) {
        const jobId = `job-${weekOffset}-${dayOffset}-${jobIndex}`;
        
        // Determine job time (business hours: 7 AM - 6 PM)
        const hour = 7 + Math.floor(Math.random() * 11);
        const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hour, minute, 0, 0);
        
        // Determine job status based on date
        let status: Job['status'];
        if (currentDate < today) {
          // Past jobs - mostly completed
          status = Math.random() > 0.15 ? 'completed' : 'cancelled';
        } else if (currentDate.toDateString() === today.toDateString()) {
          // Today's jobs - mix of statuses
          const rand = Math.random();
          if (scheduledTime < new Date()) {
            status = rand > 0.7 ? 'completed' : rand > 0.4 ? 'in-progress' : 'en-route';
          } else {
            status = rand > 0.6 ? 'confirmed' : 'pending';
          }
        } else {
          // Future jobs - pending or confirmed
          status = Math.random() > 0.4 ? 'confirmed' : 'pending';
        }
        
        // Select random customer and technician
        const customerId = mockCustomers[Math.floor(Math.random() * mockCustomers.length)].id;
        const assignedUserId = Math.random() > 0.1 ? mockUsers[Math.floor(Math.random() * 2) + 1].id : undefined;
        
        // Job types based on day and season
        const jobTypes = [
          'Maintenance', 'Repair', 'Installation', 'Emergency Service', 
          'Inspection', 'Filter Change', 'Thermostat Install', 'Duct Cleaning'
        ];
        const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
        
        // Priority based on job type and timing
        let priority: Job['priority'] = 'medium';
        if (jobType === 'Emergency Service') priority = 'urgent';
        else if (jobType === 'Maintenance') priority = 'low';
        else if (Math.random() > 0.8) priority = 'high';
        
        jobs.push({
          id: jobId,
          businessId: 'biz-1',
          customerId,
          assignedUserId,
          scheduledTime,
          estimatedDuration: getEstimatedDuration(jobType),
          status,
          location: mockCustomers.find(c => c.id === customerId)?.address || '123 Main St, Memphis, TN',
          jobType,
          description: getJobDescription(jobType),
          checklist: generateChecklist(jobType),
          notes: getRandomNotes(),
          photos: [],
          priority,
          tradeSpecificData: generateTradeSpecificData(jobType),
          createdAt: new Date(scheduledTime.getTime() - 24 * 60 * 60 * 1000),
          updatedAt: new Date()
        });
      }
    }
  }
  
  return jobs.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
};

const getEstimatedDuration = (jobType: string): number => {
  const durations = {
    'Maintenance': 90,
    'Repair': 120,
    'Installation': 240,
    'Emergency Service': 180,
    'Inspection': 60,
    'Filter Change': 30,
    'Thermostat Install': 90,
    'Duct Cleaning': 180
  };
  return durations[jobType] || 120;
};

const getJobDescription = (jobType: string): string => {
  const descriptions = {
    'Maintenance': [
      'Seasonal HVAC maintenance and filter replacement',
      'Quarterly system inspection and tune-up',
      'Annual maintenance contract service',
      'Preventive maintenance check'
    ],
    'Repair': [
      'Unit not cooling properly - needs diagnosis',
      'Strange noises from outdoor unit',
      'Thermostat not responding to temperature changes',
      'Refrigerant leak repair needed',
      'Compressor making unusual sounds'
    ],
    'Installation': [
      'New 3-ton HVAC unit installation',
      'Smart thermostat upgrade installation',
      'Ductwork installation for addition',
      'Air purifier system installation'
    ],
    'Emergency Service': [
      'No heat emergency - system completely down',
      'Complete AC failure during heat wave',
      'Urgent repair needed - commercial facility',
      'After-hours emergency service call'
    ],
    'Inspection': [
      'Pre-purchase home HVAC inspection',
      'Insurance required system inspection',
      'Annual safety and efficiency inspection',
      'Warranty compliance inspection'
    ],
    'Filter Change': [
      'Monthly filter replacement service',
      'High-efficiency filter upgrade',
      'Multiple unit filter change',
      'Emergency filter replacement'
    ],
    'Thermostat Install': [
      'Programmable thermostat installation',
      'Smart thermostat with WiFi setup',
      'Multi-zone thermostat system',
      'Thermostat replacement and calibration'
    ],
    'Duct Cleaning': [
      'Whole house duct cleaning service',
      'Post-renovation duct cleaning',
      'Allergy-focused duct sanitization',
      'Commercial duct cleaning and inspection'
    ]
  };
  
  const typeDescriptions = descriptions[jobType] || descriptions['Maintenance'];
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
};

const generateChecklist = (jobType: string) => {
  const checklists = {
    'Maintenance': [
      { id: 'c1', text: 'Check and replace air filters', completed: Math.random() > 0.3 },
      { id: 'c2', text: 'Inspect ductwork for leaks', completed: Math.random() > 0.4 },
      { id: 'c3', text: 'Test thermostat operation', completed: Math.random() > 0.3 },
      { id: 'c4', text: 'Clean condenser coils', completed: Math.random() > 0.5 },
      { id: 'c5', text: 'Check refrigerant levels', completed: Math.random() > 0.6 }
    ],
    'Repair': [
      { id: 'c1', text: 'Diagnose system issue', completed: Math.random() > 0.2 },
      { id: 'c2', text: 'Order replacement parts if needed', completed: Math.random() > 0.5 },
      { id: 'c3', text: 'Complete repair work', completed: Math.random() > 0.7 },
      { id: 'c4', text: 'Test system operation', completed: Math.random() > 0.8 }
    ],
    'Installation': [
      { id: 'c1', text: 'Remove old unit safely', completed: Math.random() > 0.2 },
      { id: 'c2', text: 'Install new unit', completed: Math.random() > 0.4 },
      { id: 'c3', text: 'Connect electrical and refrigerant lines', completed: Math.random() > 0.6 },
      { id: 'c4', text: 'Test complete system operation', completed: Math.random() > 0.8 },
      { id: 'c5', text: 'Customer walkthrough and training', completed: Math.random() > 0.9 }
    ],
    'Emergency Service': [
      { id: 'c1', text: 'Rapid system diagnosis', completed: Math.random() > 0.2 },
      { id: 'c2', text: 'Implement temporary solution', completed: Math.random() > 0.4 },
      { id: 'c3', text: 'Complete permanent repair', completed: Math.random() > 0.7 },
      { id: 'c4', text: 'Verify system stability', completed: Math.random() > 0.8 }
    ]
  };
  
  return checklists[jobType] || checklists['Maintenance'];
};

const getRandomNotes = (): string => {
  const notes = [
    'Customer mentioned unusual noise from upstairs unit',
    'Recommend filter upgrade for better air quality',
    'System is aging, may need replacement within 2 years',
    'Customer very satisfied with prompt service',
    'Left business card for future service needs',
    'Scheduled follow-up maintenance for next quarter',
    'Customer has pets - recommend monthly filter changes',
    'Access through side gate - customer provided code',
    'Prefer morning appointments due to work schedule',
    'Commercial account - coordinate with facility manager'
  ];
  
  return Math.random() > 0.4 ? notes[Math.floor(Math.random() * notes.length)] : '';
};

const generateTradeSpecificData = (jobType: string) => {
  const systemAges = [1, 3, 5, 8, 12, 15, 18, 22];
  const seerRatings = [10, 13, 14, 16, 18, 20];
  const refrigerantTypes = ['R-410A', 'R-22', 'R-134A'];
  const unitNumbers = ['Unit 1', 'Unit 2', 'Main Floor', 'Upstairs', 'Basement'];
  
  return {
    systemAge: systemAges[Math.floor(Math.random() * systemAges.length)],
    seerRating: seerRatings[Math.floor(Math.random() * seerRatings.length)],
    refrigerantType: refrigerantTypes[Math.floor(Math.random() * refrigerantTypes.length)],
    unitNumber: Math.random() > 0.3 ? unitNumbers[Math.floor(Math.random() * unitNumbers.length)] : undefined,
    lastFilterChange: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
  };
};

export const mockJobs: Job[] = generateRealisticJobs();

export const mockEstimates: Estimate[] = [
  {
    id: 'est-1',
    jobId: mockJobs[0]?.id || 'job-1',
    lineItems: [
      {
        id: 'li-1',
        description: 'Compressor Replacement - 3 Ton',
        quantity: 1,
        unitPrice: 850.00,
        total: 850.00,
        category: 'Parts'
      },
      {
        id: 'li-2',
        description: 'Labor - Emergency Service',
        quantity: 4,
        unitPrice: 95.00,
        total: 380.00,
        category: 'Labor'
      },
      {
        id: 'li-3',
        description: 'Refrigerant R-410A',
        quantity: 3,
        unitPrice: 125.00,
        total: 375.00,
        category: 'Parts'
      }
    ],
    subtotal: 1605.00,
    tax: 144.45,
    discount: 0,
    total: 1749.45,
    approved: true,
    sentAt: new Date('2024-01-21T16:00:00'),
    approvedAt: new Date('2024-01-22T08:30:00'),
    expiresAt: new Date('2024-01-28T23:59:59')
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    businessId: 'biz-1',
    name: 'Air Filter - 16x25x1 MERV 8',
    category: 'Filters',
    sku: 'AF-16251-M8',
    stockLevel: 45,
    reorderThreshold: 20,
    costPerUnit: 8.50,
    supplier: 'Memphis HVAC Supply',
    tradeSpecific: true,
    lastUpdated: new Date('2024-01-20')
  },
  {
    id: 'inv-2',
    businessId: 'biz-1',
    name: 'Compressor - 3 Ton R-410A',
    category: 'Components',
    sku: 'COMP-3T-410A',
    stockLevel: 3,
    reorderThreshold: 5,
    costPerUnit: 650.00,
    supplier: 'Professional Parts Inc',
    tradeSpecific: true,
    lastUpdated: new Date('2024-01-18')
  },
  {
    id: 'inv-3',
    businessId: 'biz-1',
    name: 'Refrigerant R-410A (25lb)',
    category: 'Refrigerants',
    sku: 'REF-410A-25',
    stockLevel: 8,
    reorderThreshold: 12,
    costPerUnit: 125.00,
    supplier: 'Cool Tech Supplies',
    tradeSpecific: true,
    lastUpdated: new Date('2024-01-19')
  },
  {
    id: 'inv-4',
    businessId: 'biz-1',
    name: 'Programmable Thermostat',
    category: 'Controls',
    sku: 'THERM-PROG-7D',
    stockLevel: 15,
    reorderThreshold: 10,
    costPerUnit: 89.99,
    supplier: 'Memphis HVAC Supply',
    tradeSpecific: true,
    lastUpdated: new Date('2024-01-17')
  },
  {
    id: 'inv-5',
    businessId: 'biz-1',
    name: 'Duct Tape - Professional Grade',
    category: 'Supplies',
    sku: 'TAPE-DUCT-PRO',
    stockLevel: 24,
    reorderThreshold: 15,
    costPerUnit: 12.99,
    supplier: 'Memphis HVAC Supply',
    tradeSpecific: false,
    lastUpdated: new Date('2024-01-19')
  }
];