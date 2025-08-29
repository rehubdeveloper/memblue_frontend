import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Package, Clock, Check, Wrench, User } from 'lucide-react';
import { useAuth } from '../../context/AppContext';

interface Notification {
  id: string;
  type: 'pending_job' | 'out_of_stock' | 'overdue_job' | 'low_inventory' | 'new_customer' | 'system' | 
        'job_created' | 'job_status_changed' | 'job_deleted' | 'customer_created' | 'customer_updated' | 'customer_deleted' |
        'inventory_created' | 'inventory_updated' | 'inventory_deleted' | 'team_invite_sent' | 'team_member_joined' |
        'estimate_created' | 'estimate_status_changed' | 'invoice_created' | 'invoice_paid';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

const NotificationSystem: React.FC = () => {
  const { user, workOrders, inventoryList, customers } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [immediateNotifications, setImmediateNotifications] = useState<Notification[]>([]);

  // Load existing notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        // Convert timestamp strings back to Date objects
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        
        // Filter out notifications older than 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentNotifications = notificationsWithDates.filter((n: any) => 
          n.timestamp > oneWeekAgo
        );
        
        setNotifications(recentNotifications);
        setUnreadCount(recentNotifications.filter((n: any) => !n.read).length);
        
        // Update localStorage with filtered notifications
        if (recentNotifications.length !== notificationsWithDates.length) {
          localStorage.setItem('notifications', JSON.stringify(recentNotifications));
        }
      } catch (error) {
        console.error('Error loading notifications from localStorage:', error);
      }
    }
  }, []);

  // Track dismissed notification types to prevent regeneration
  const [dismissedTypes, setDismissedTypes] = useState<Set<string>>(new Set());

  // Function to add immediate notification
  const addImmediateNotification = (notification: Notification) => {
    setImmediateNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setImmediateNotifications(prev => prev.filter(n => n.id !== notification.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }, 5000);
  };

  // Expose the function globally so context can use it
  React.useEffect(() => {
    (window as any).addImmediateNotification = addImmediateNotification;
    return () => {
      delete (window as any).addImmediateNotification;
    };
  }, []);

  // Load dismissed types from localStorage
  useEffect(() => {
    const savedDismissedTypes = localStorage.getItem('dismissedNotificationTypes');
    if (savedDismissedTypes) {
      try {
        const parsed = JSON.parse(savedDismissedTypes);
        setDismissedTypes(new Set(parsed));
      } catch (error) {
        console.error('Error loading dismissed notification types:', error);
      }
    }
  }, []);

  // Generate notifications based on current data
  useEffect(() => {
    const generateNotifications = (): Notification[] => {
      const newNotifications: Notification[] = [];
      let notificationId = 1;

             // Check for pending jobs
       if (workOrders && !dismissedTypes.has('pending_job')) {
         const pendingJobs = workOrders.filter(job => job.status === 'pending');
         if (pendingJobs.length > 0) {
           newNotifications.push({
             id: `pending_jobs_${Date.now()}_${notificationId++}`,
             type: 'pending_job',
             title: 'Pending Jobs',
             message: `${pendingJobs.length} job(s) are pending and need attention`,
             timestamp: new Date(),
             read: false,
             actionUrl: '/jobs?tab=work-orders',
             priority: 'high'
           });
         }
       }

             // Check for overdue jobs
       if (workOrders && !dismissedTypes.has('overdue_job')) {
         const today = new Date();
         const overdueJobs = workOrders.filter(job => {
           const scheduledDate = new Date(job.scheduled_for);
           return scheduledDate < today && ['pending', 'confirmed'].includes(job.status);
         });
         
         if (overdueJobs.length > 0) {
           newNotifications.push({
             id: `overdue_jobs_${Date.now()}_${notificationId++}`,
             type: 'overdue_job',
             title: 'Overdue Jobs',
             message: `${overdueJobs.length} job(s) are overdue`,
             timestamp: new Date(),
             read: false,
             actionUrl: '/jobs?tab=work-orders',
             priority: 'high'
           });
         }
       }

      // Check for out of stock inventory
      if (inventoryList && !dismissedTypes.has('out_of_stock')) {
        const outOfStockItems = inventoryList.filter(item => 
          item.quantity === 0 || item.quantity <= 0
        );
        
        if (outOfStockItems.length > 0) {
          newNotifications.push({
            id: `out_of_stock_${Date.now()}_${notificationId++}`,
            type: 'out_of_stock',
            title: 'Out of Stock Items',
            message: `${outOfStockItems.length} inventory item(s) are out of stock`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/inventory',
            priority: 'medium'
          });
        }
      }

      // Check for low inventory (less than 5 items)
      if (inventoryList && !dismissedTypes.has('low_inventory')) {
        const lowStockItems = inventoryList.filter(item => 
          item.quantity > 0 && item.quantity < 5
        );
        
        if (lowStockItems.length > 0) {
          newNotifications.push({
            id: `low_inventory_${Date.now()}_${notificationId++}`,
            type: 'low_inventory',
            title: 'Low Inventory Alert',
            message: `${lowStockItems.length} item(s) are running low on stock`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/inventory',
            priority: 'medium'
          });
        }
      }

      // Check for new customers (created in the last 7 days)
      if (customers && !dismissedTypes.has('new_customer')) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newCustomers = customers.filter(customer => {
          const createdDate = new Date(customer.created_at);
          return createdDate > oneWeekAgo;
        });
        
        if (newCustomers.length > 0) {
          newNotifications.push({
            id: `new_customers_${Date.now()}_${notificationId++}`,
            type: 'new_customer',
            title: 'New Customers',
            message: `${newCustomers.length} new customer(s) added this week`,
            timestamp: new Date(),
            read: false,
            actionUrl: '/customers',
            priority: 'low'
          });
        }
      }

      return newNotifications;
    };

    // Only generate new notifications if we have data and haven't dismissed them
    if (workOrders || inventoryList || customers) {
      const newNotifications = generateNotifications();
      
      // Merge with existing notifications, avoiding duplicates by type
      const existingNotifications = notifications.filter(n => n.read);
      const existingTypes = new Set(existingNotifications.map(n => n.type));
      
      // Only add new notifications that don't already exist
      const uniqueNewNotifications = newNotifications.filter(n => !existingTypes.has(n.type));
      
      const allNotifications = [...existingNotifications, ...uniqueNewNotifications];
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
    }
  }, [workOrders, inventoryList, customers, dismissedTypes]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => {
      const updated = prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      // Dismiss all notification types permanently
      const allTypes = [...new Set(prev.map(n => n.type))];
      allTypes.forEach(type => dismissNotificationType(type));
      
      const updated = prev.map(notification => ({ ...notification, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
    setUnreadCount(0);
  };

  const clearReadNotifications = () => {
    setNotifications(prev => {
      const unreadOnly = prev.filter(notification => !notification.read);
      localStorage.setItem('notifications', JSON.stringify(unreadOnly));
      return unreadOnly;
    });
  };

  const dismissNotificationType = (type: string) => {
    setDismissedTypes(prev => {
      const newSet = new Set(prev);
      newSet.add(type);
      localStorage.setItem('dismissedNotificationTypes', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'pending_job':
      case 'overdue_job':
        return <Clock className="w-5 h-5" />;
      case 'out_of_stock':
      case 'low_inventory':
      case 'inventory_created':
      case 'inventory_updated':
      case 'inventory_deleted':
        return <Package className="w-5 h-5" />;
      case 'new_customer':
      case 'customer_created':
      case 'customer_updated':
      case 'customer_deleted':
        return <CheckCircle className="w-5 h-5" />;
      case 'job_created':
      case 'job_status_changed':
      case 'job_deleted':
        return <Wrench className="w-5 h-5" />;
      case 'team_invite_sent':
      case 'team_member_joined':
        return <User className="w-5 h-5" />;
      case 'estimate_created':
      case 'estimate_status_changed':
      case 'invoice_created':
      case 'invoice_paid':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityTextColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-700';
      case 'medium':
        return 'text-yellow-700';
      case 'low':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.some(n => n.read) && (
                  <button
                    onClick={clearReadNotifications}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Clear read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-2">
            {/* Immediate Notifications */}
            {immediateNotifications.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-2 px-1">Recent Activity</div>
                <div className="space-y-2">
                  {immediateNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border-l-4 animate-pulse ${
                        getPriorityColor(notification.priority)
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 mt-0.5 ${
                          getPriorityTextColor(notification.priority)
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm mt-1 text-gray-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Just now
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 my-3"></div>
              </div>
            )}

            {/* Regular Notifications */}
            {notifications.length === 0 && immediateNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 transition-all ${
                      notification.read 
                        ? 'opacity-60 bg-gray-50 border-l-gray-300' 
                        : getPriorityColor(notification.priority)
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 mt-0.5 ${
                        notification.read ? 'text-gray-400' : getPriorityTextColor(notification.priority)
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.read ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-700'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 flex-shrink-0 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        
                                                 {notification.actionUrl && (
                           <button
                             onClick={() => {
                               // Dismiss this notification type permanently
                               dismissNotificationType(notification.type);
                               
                               // Remove the notification from the list
                               setNotifications(prev => {
                                 const updated = prev.filter(n => n.id !== notification.id);
                                 localStorage.setItem('notifications', JSON.stringify(updated));
                                 return updated;
                               });
                               setUnreadCount(prev => Math.max(0, prev - 1));
                               
                               // Navigate to the action URL
                               window.location.href = notification.actionUrl!;
                             }}
                             className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                           >
                             View Details →
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default NotificationSystem;
