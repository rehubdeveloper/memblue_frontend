import { TradeConfig } from '../types';

export const tradeConfigs: Record<string, TradeConfig> = {
  hvac: {
    name: 'HVAC Pro',
    icon: '🔥',
    color: 'bg-red-500',
    defaultJobDuration: 120,
    jobTypes: [
      'Maintenance',
      'Repair',
      'Installation',
      'Filter Change',
      'System Inspection',
      'Duct Cleaning',
      'Thermostat Install',
      'Emergency Service'
    ],
    inventoryCategories: [
      'Filters',
      'Refrigerants',
      'Components',
      'Thermostats',
      'Ductwork',
      'Tools'
    ],
    checklistTemplates: [
      {
        id: 'hvac-maintenance',
        name: 'Seasonal Maintenance',
        items: [
          'Check air filters',
          'Inspect ductwork for leaks',
          'Test thermostat operation',
          'Clean condenser coils',
          'Check refrigerant levels',
          'Inspect electrical connections',
          'Test system operation'
        ]
      },
      {
        id: 'hvac-install',
        name: 'Unit Installation',
        items: [
          'Remove old unit',
          'Install new unit',
          'Connect electrical',
          'Connect refrigerant lines',
          'Test system operation',
          'Program thermostat',
          'Customer walkthrough'
        ]
      }
    ],
    quickLineItems: [
      { id: 'hvac-1', description: 'Service Call', category: 'Labor', defaultPrice: 85, unit: 'each' },
      { id: 'hvac-2', description: 'Filter Replacement', category: 'Parts', defaultPrice: 25, unit: 'each' },
      { id: 'hvac-3', description: 'Refrigerant R-410A', category: 'Parts', defaultPrice: 125, unit: 'lb' },
      { id: 'hvac-4', description: 'Thermostat Installation', category: 'Labor', defaultPrice: 150, unit: 'each' }
    ]
  },
  electrical: {
    name: 'Electrician Pro',
    icon: '⚡',
    color: 'bg-yellow-500',
    defaultJobDuration: 90,
    jobTypes: [
      'Outlet Installation',
      'Panel Upgrade',
      'Wiring Repair',
      'Light Fixture Install',
      'Ceiling Fan Install',
      'Electrical Inspection',
      'Emergency Service',
      'Code Compliance'
    ],
    inventoryCategories: [
      'Outlets & Switches',
      'Breakers',
      'Wire & Cable',
      'Fixtures',
      'Conduit',
      'Tools'
    ],
    checklistTemplates: [
      {
        id: 'electrical-outlet',
        name: 'Outlet Installation',
        items: [
          'Turn off power at breaker',
          'Test with voltage meter',
          'Run new wire if needed',
          'Install outlet box',
          'Connect wiring',
          'Install outlet',
          'Test operation',
          'Update panel labeling'
        ]
      },
      {
        id: 'electrical-panel',
        name: 'Panel Upgrade',
        items: [
          'Obtain permits',
          'Coordinate utility disconnect',
          'Remove old panel',
          'Install new panel',
          'Reconnect circuits',
          'Label all breakers',
          'Schedule inspection',
          'Restore power'
        ]
      }
    ],
    quickLineItems: [
      { id: 'elec-1', description: 'Service Call', category: 'Labor', defaultPrice: 95, unit: 'each' },
      { id: 'elec-2', description: 'GFCI Outlet', category: 'Parts', defaultPrice: 35, unit: 'each' },
      { id: 'elec-3', description: '20A Breaker', category: 'Parts', defaultPrice: 45, unit: 'each' },
      { id: 'elec-4', description: '12 AWG Wire', category: 'Parts', defaultPrice: 2.50, unit: 'ft' }
    ]
  },
  plumbing: {
    name: 'Plumber Pro',
    icon: '💧',
    color: 'bg-blue-500',
    defaultJobDuration: 90,
    jobTypes: [
      'Leak Repair',
      'Drain Cleaning',
      'Fixture Installation',
      'Water Heater Service',
      'Pipe Repair',
      'Toilet Repair',
      'Emergency Service',
      'Inspection'
    ],
    inventoryCategories: [
      'Fixtures',
      'Pipes & Fittings',
      'Water Heaters',
      'Drain Supplies',
      'Tools',
      'Chemicals'
    ],
    checklistTemplates: [
      {
        id: 'plumb-water-heater',
        name: 'Water Heater Installation',
        items: [
          'Turn off water and gas/electric',
          'Drain old water heater',
          'Disconnect old unit',
          'Install new water heater',
          'Connect water lines',
          'Connect gas/electric',
          'Fill and test',
          'Check for leaks'
        ]
      },
      {
        id: 'plumb-fixture',
        name: 'Fixture Installation',
        items: [
          'Turn off water supply',
          'Remove old fixture',
          'Check rough-in measurements',
          'Install new fixture',
          'Connect water lines',
          'Test operation',
          'Check for leaks',
          'Clean up area'
        ]
      }
    ],
    quickLineItems: [
      { id: 'plumb-1', description: 'Service Call', category: 'Labor', defaultPrice: 90, unit: 'each' },
      { id: 'plumb-2', description: 'Toilet Installation', category: 'Labor', defaultPrice: 200, unit: 'each' },
      { id: 'plumb-3', description: 'PVC Pipe 3/4"', category: 'Parts', defaultPrice: 3.50, unit: 'ft' },
      { id: 'plumb-4', description: 'Drain Cleaning', category: 'Labor', defaultPrice: 150, unit: 'each' }
    ]
  },
  locksmith: {
    name: 'Locksmith Pro',
    icon: '🔑',
    color: 'bg-purple-500',
    defaultJobDuration: 60,
    jobTypes: [
      'Lockout Service',
      'Lock Installation',
      'Key Duplication',
      'Rekey Service',
      'Smart Lock Install',
      'Safe Service',
      'Emergency Service',
      'Security Consultation'
    ],
    inventoryCategories: [
      'Locks',
      'Keys & Blanks',
      'Smart Locks',
      'Safes',
      'Tools',
      'Hardware'
    ],
    checklistTemplates: [
      {
        id: 'lock-rekey',
        name: 'Rekey Service',
        items: [
          'Verify customer identity',
          'Remove lock cylinder',
          'Change pin configuration',
          'Test new key operation',
          'Reinstall cylinder',
          'Test lock operation',
          'Provide new keys',
          'Update customer records'
        ]
      },
      {
        id: 'lock-smart-install',
        name: 'Smart Lock Installation',
        items: [
          'Check door compatibility',
          'Remove old lock',
          'Install smart lock hardware',
          'Connect to power/batteries',
          'Configure smart features',
          'Test all functions',
          'Set up customer app',
          'Provide instruction manual'
        ]
      }
    ],
    quickLineItems: [
      { id: 'lock-1', description: 'Service Call', category: 'Labor', defaultPrice: 75, unit: 'each' },
      { id: 'lock-2', description: 'Lockout Service', category: 'Labor', defaultPrice: 120, unit: 'each' },
      { id: 'lock-3', description: 'Deadbolt Installation', category: 'Labor', defaultPrice: 100, unit: 'each' },
      { id: 'lock-4', description: 'Key Duplication', category: 'Labor', defaultPrice: 5, unit: 'each' }
    ]
  },
  'general-contractor': {
    name: 'GC Pro',
    icon: '🧱',
    color: 'bg-orange-500',
    defaultJobDuration: 480, // 8 hours
    jobTypes: [
      'Renovation',
      'New Construction',
      'Repair',
      'Inspection',
      'Consultation',
      'Permit Application',
      'Subcontractor Coordination',
      'Final Walkthrough'
    ],
    inventoryCategories: [
      'Lumber',
      'Hardware',
      'Drywall',
      'Paint',
      'Flooring',
      'Tools'
    ],
    checklistTemplates: [
      {
        id: 'gc-renovation',
        name: 'Renovation Project',
        items: [
          'Obtain permits',
          'Schedule inspections',
          'Coordinate subcontractors',
          'Order materials',
          'Complete framing',
          'Install electrical/plumbing',
          'Drywall and paint',
          'Final inspection'
        ]
      },
      {
        id: 'gc-repair',
        name: 'General Repair',
        items: [
          'Assess damage',
          'Provide estimate',
          'Order materials',
          'Complete repairs',
          'Clean up area',
          'Final walkthrough',
          'Warranty documentation'
        ]
      }
    ],
    quickLineItems: [
      { id: 'gc-1', description: 'Consultation', category: 'Labor', defaultPrice: 150, unit: 'hour' },
      { id: 'gc-2', description: 'General Labor', category: 'Labor', defaultPrice: 65, unit: 'hour' },
      { id: 'gc-3', description: 'Material Markup', category: 'Materials', defaultPrice: 0, unit: 'percent' },
      { id: 'gc-4', description: 'Permit Fees', category: 'Other', defaultPrice: 200, unit: 'each' }
    ]
  }
};